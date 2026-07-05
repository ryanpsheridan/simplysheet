export const SITE_TITLE = 'Simply Sheet Design';
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
