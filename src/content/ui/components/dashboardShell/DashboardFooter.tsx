interface DashboardFooterProps {
    contactLink: string;
}

export function DashboardFooter({ contactLink }: DashboardFooterProps) {
    const currentYear = new Date().getFullYear();

    return (
        <footer
            id="ecdash-footer"
            className="flex items-center justify-between border-t border-zinc-100 bg-white px-4 py-2 text-[12px] text-zinc-500"
        >
            <span className="ecdash-copyright font-medium">
                © {currentYear} Cotton. All rights reserved.
            </span>
            <a
                id="ecdash-contact-link"
                href={contactLink}
                target="_blank"
                rel="noopener noreferrer"
                className="ecdash-contact-link font-semibold text-zinc-700 transition hover:text-zinc-900"
            >
                문의
            </a>
        </footer>
    );
}
