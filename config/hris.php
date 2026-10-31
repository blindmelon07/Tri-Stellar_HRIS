<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Payroll
    |--------------------------------------------------------------------------
    |
    | Monthly-rated employees are converted to a daily rate using
    | (monthly rate × 12) ÷ working days per year. Use 261 for a 5-day
    | work week or 313 for a 6-day work week.
    |
    | Multipliers follow the Philippine Labor Code defaults.
    |
    */

    'payroll' => [
        'working_days_per_year' => (int) env('HRIS_WORKING_DAYS_PER_YEAR', 313),
        'overtime_multiplier' => 1.25,
        'regular_holiday_worked_multiplier' => 2.0,
        'special_holiday_worked_multiplier' => 1.3,

        // Statutory deductions start one month after the date hired.
        'statutory_grace_months' => 1,
    ],

    /*
    |--------------------------------------------------------------------------
    | Timekeeping
    |--------------------------------------------------------------------------
    |
    | Grace period before a time-in counts as late, in minutes.
    |
    */

    'timekeeping' => [
        'late_grace_minutes' => (int) env('HRIS_LATE_GRACE_MINUTES', 0),
    ],

];
