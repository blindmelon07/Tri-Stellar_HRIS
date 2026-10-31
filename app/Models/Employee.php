<?php

namespace App\Models;

use App\Enums\EmployeeLevel;
use App\Enums\EmployeeStatus;
use App\Enums\EmploymentStatus;
use App\Enums\PaymentMethod;
use App\Enums\PayType;
use Carbon\CarbonImmutable;
use Database\Factories\EmployeeFactory;
use Illuminate\Database\Eloquent\Attributes\Appends;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property string $employee_number
 * @property int|null $user_id
 * @property string $first_name
 * @property string|null $middle_name
 * @property string $last_name
 * @property string|null $suffix
 * @property int $branch_id
 * @property int $department_id
 * @property int $shift_id
 * @property EmployeeLevel $level
 * @property string $job_title
 * @property EmployeeStatus $employee_status
 * @property EmploymentStatus $employment_status
 * @property CarbonImmutable $date_hired
 * @property CarbonImmutable|null $date_separated
 * @property PayType $pay_type
 * @property string $rate
 * @property PaymentMethod $payment_method
 * @property bool $has_statutory_deductions
 * @property string $sss_contribution
 * @property string $philhealth_contribution
 * @property string $pagibig_contribution
 * @property-read string $full_name
 * @property-read User|null $user
 * @property-read Branch $branch
 * @property-read Department $department
 * @property-read Shift $shift
 */
#[Fillable([
    'employee_number', 'user_id', 'first_name', 'middle_name', 'last_name', 'suffix',
    'birth_date', 'gender', 'civil_status', 'mobile_number', 'email', 'address',
    'branch_id', 'department_id', 'shift_id', 'level', 'job_title',
    'employee_status', 'employment_status', 'date_hired', 'date_separated',
    'pay_type', 'rate', 'payment_method', 'bank_account_number',
    'sss_number', 'philhealth_number', 'pagibig_number', 'tin',
    'has_statutory_deductions', 'sss_contribution', 'philhealth_contribution', 'pagibig_contribution',
    'emergency_contact_name', 'emergency_contact_relationship', 'emergency_contact_number',
])]
#[Appends(['full_name'])]
class Employee extends Model
{
    /** @use HasFactory<EmployeeFactory> */
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'birth_date' => 'date:Y-m-d',
            'date_hired' => 'date:Y-m-d',
            'date_separated' => 'date:Y-m-d',
            'level' => EmployeeLevel::class,
            'employee_status' => EmployeeStatus::class,
            'employment_status' => EmploymentStatus::class,
            'pay_type' => PayType::class,
            'payment_method' => PaymentMethod::class,
            'rate' => 'decimal:2',
            'has_statutory_deductions' => 'boolean',
            'sss_contribution' => 'decimal:2',
            'philhealth_contribution' => 'decimal:2',
            'pagibig_contribution' => 'decimal:2',
        ];
    }

    /**
     * @return Attribute<string, never>
     */
    protected function fullName(): Attribute
    {
        return Attribute::get(fn (): string => trim(implode(' ', array_filter([
            $this->last_name.',',
            $this->first_name,
            $this->middle_name ? mb_substr($this->middle_name, 0, 1).'.' : null,
            $this->suffix,
        ]))));
    }

    /**
     * @param  Builder<Employee>  $query
     */
    #[Scope]
    protected function active(Builder $query): void
    {
        $query->where('employee_status', EmployeeStatus::Active);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return BelongsTo<Branch, $this>
     */
    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    /**
     * @return BelongsTo<Department, $this>
     */
    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    /**
     * @return BelongsTo<Shift, $this>
     */
    public function shift(): BelongsTo
    {
        return $this->belongsTo(Shift::class);
    }

    /**
     * @return HasMany<TimeLog, $this>
     */
    public function timeLogs(): HasMany
    {
        return $this->hasMany(TimeLog::class);
    }

    /**
     * @return HasMany<Filing, $this>
     */
    public function filings(): HasMany
    {
        return $this->hasMany(Filing::class);
    }

    /**
     * @return HasMany<Loan, $this>
     */
    public function loans(): HasMany
    {
        return $this->hasMany(Loan::class);
    }

    /**
     * @return HasMany<Payslip, $this>
     */
    public function payslips(): HasMany
    {
        return $this->hasMany(Payslip::class);
    }

    /**
     * Departments this employee heads.
     *
     * @return HasMany<Department, $this>
     */
    public function headedDepartments(): HasMany
    {
        return $this->hasMany(Department::class, 'head_employee_id');
    }

    /**
     * Filings from this Dept. Head's team (excluding their own) that they may endorse.
     *
     * @return Builder<Filing>
     */
    public function endorsableFilings(): Builder
    {
        return Filing::query()
            ->whereHas('employee', fn (Builder $query) => $query->whereIn('department_id', $this->headedDepartments()->select('id')))
            ->whereNot('employee_id', $this->id);
    }

    public function canEndorse(Filing $filing): bool
    {
        return $filing->employee_id !== $this->id
            && $this->headedDepartments()->whereKey($filing->employee->department_id)->exists();
    }

    /**
     * The employee's daily rate, derived from a monthly rate when needed.
     */
    public function dailyRate(): float
    {
        if ($this->pay_type === PayType::Monthly) {
            return round((float) $this->rate * 12 / config('hris.payroll.working_days_per_year'), 2);
        }

        return (float) $this->rate;
    }
}
