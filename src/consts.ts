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

// Builds the <title>, appending the site name only when the result still fits
// the ~60 characters Google renders before truncating.
//
// Every layout used to append " — Simply Sheets" unconditionally, which costs
// 16 characters. That is free on a short title and actively harmful on a long
// one: the suffix pushes the page's own keywords past the cutoff, so the
// result is an ellipsis where the brand was meant to be. Dropping it on the
// long ones loses little, since Google commonly appends the site name to the
// SERP entry itself regardless of what the tag says.
export const TITLE_MAX = 60;

export function pageTitle(title: string): string {
	const withBrand = `${title} — ${SITE_TITLE}`;
	return withBrand.length <= TITLE_MAX ? withBrand : title;
}
