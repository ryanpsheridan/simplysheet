export const SITE_TITLE = 'Simply Sheets';
export const SITE_DESCRIPTION = 'Practical budgeting advice, simple systems, and the tools to help you understand where your money goes.';

export const ALL_TAGS = [
	{ slug: 'expense-tracking', label: 'Expense Tracking' },
	{ slug: 'couples-budgeting', label: 'Couples Budgeting' },
	{ slug: 'debt-payoff', label: 'Debt Payoff' },
	{ slug: 'savings-goals', label: 'Savings Goals' },
	{ slug: 'irregular-income', label: 'Irregular Income' },
	{ slug: 'net-worth', label: 'Net Worth' },
	{ slug: 'budgeting-styles', label: 'Budgeting Styles' },
];

export const TAG_MAP: Record<string, string> = Object.fromEntries(
	ALL_TAGS.map((t) => [t.slug, t.label])
);

export const ARTICLES_PAGE_SIZE = 12;

export const ETSY_SHOP_URL = 'https://simplysheetdesign.etsy.com';

// Every user-clickable Etsy link must use the simplysheetdesign.etsy.com
// domain (that's what earns the Share & Save fee credit — www.etsy.com links
// don't) and carry these UTM params so Etsy Shop Stats can separate site
// traffic from social links. UTMs don't affect the Share & Save credit.
export function withEtsyTracking(url: string): string {
	const tracked = new URL(url);
	tracked.searchParams.set('utm_source', 'simplysheetdesign.com');
	tracked.searchParams.set('utm_medium', 'referral');
	return tracked.toString();
}
