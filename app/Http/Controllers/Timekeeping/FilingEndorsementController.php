<?php

namespace App\Http\Controllers\Timekeeping;

use App\Enums\FilingStatus;
use App\Http\Controllers\Controller;
use App\Models\Filing;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Dept. Head review of filings from their department's employees.
 */
class FilingEndorsementController extends Controller
{
    public function index(Request $request): Response
    {
        $departmentIds = $request->user()->employee->headedDepartments()->pluck('id');
        $showAll = $request->boolean('all');

        $filings = Filing::query()
            ->with(['employee:id,employee_number,first_name,last_name,middle_name,suffix', 'shift:id,name'])
            ->whereHas('employee', fn (Builder $query) => $query->whereIn('department_id', $departmentIds))
            ->whereNot('employee_id', $request->user()->employee->id)
            ->unless($showAll, fn (Builder $query) => $query->where('status', FilingStatus::Pending))
            ->latest()
            ->paginate(30)
            ->withQueryString();

        return Inertia::render('timekeeping/endorsements', [
            'filings' => $filings,
            'showAll' => $showAll,
        ]);
    }

    public function update(Request $request, Filing $filing): RedirectResponse
    {
        $validated = $request->validate([
            'decision' => ['required', Rule::in(['endorse', 'deny'])],
            'remarks' => ['nullable', 'string', 'max:1000'],
        ]);

        $headsDepartment = $request->user()->employee->headedDepartments()->whereKey($filing->employee->department_id)->exists();

        abort_unless($headsDepartment && $filing->employee_id !== $request->user()->employee->id, 403);

        if ($filing->status !== FilingStatus::Pending) {
            return Inertia::flash('error', 'This filing has already been reviewed.')->back();
        }

        $validated['decision'] === 'endorse'
            ? $filing->endorse($request->user(), $validated['remarks'] ?? null)
            : $filing->deny($request->user(), $validated['remarks'] ?? null);

        return Inertia::flash('success', 'Filing '.($validated['decision'] === 'endorse' ? 'endorsed to HR' : 'denied').'.')->back();
    }
}
