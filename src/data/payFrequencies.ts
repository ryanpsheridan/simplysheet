export type PayFrequencyKey = 'weekly' | 'biweekly' | 'semimonthly';

export interface PayFrequency {
	key: PayFrequencyKey;
	/** Label used in the in-calculator select and the cross-page frequency nav. */
	label: string;
	paychecksPerYear: number;
	/** Paychecks in an ordinary month. */
	typicalPerMonth: number;
	/**
	 * Paychecks in the occasional heavier month. Absent for semi-monthly, which
	 * pays on fixed dates and so never gains an extra check.
	 */
	extraPerMonth?: number;
	/** Dedicated tool page for this frequency. */
	url: string;
}

/**
 * Shared by PaycheckCalculator.astro (both its server-rendered markup and its
 * inline script, via define:vars) and PaycheckFrequencyNav.astro, so the
 * paycheck counts and the page URLs are defined exactly once.
 */
export const PAY_FREQUENCIES: Record<PayFrequencyKey, PayFrequency> = {
	weekly: {
		key: 'weekly',
		label: 'Weekly',
		paychecksPerYear: 52,
		typicalPerMonth: 4,
		extraPerMonth: 5,
		url: '/tools/weekly-paycheck-calculator/',
	},
	biweekly: {
		key: 'biweekly',
		label: 'Biweekly',
		paychecksPerYear: 26,
		typicalPerMonth: 2,
		extraPerMonth: 3,
		url: '/tools/biweekly-paycheck-calculator/',
	},
	semimonthly: {
		key: 'semimonthly',
		label: 'Semi-monthly',
		paychecksPerYear: 24,
		typicalPerMonth: 2,
		url: '/tools/semi-monthly-paycheck-calculator/',
	},
};

/** Nav order runs shortest interval to longest, matching the select. */
export const PAY_FREQUENCY_ORDER: PayFrequencyKey[] = ['weekly', 'biweekly', 'semimonthly'];
