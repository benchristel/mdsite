export function link(_, args) {
    const search = args[0];
    return (context) => {
        const { classes, href, title } = abstractLink(search, context);
        return `<a${classes} href="${href}">${title}</a>`;
    };
}
function abstractLink(search, context) {
    const targets = context.globalInfo.orderedLinkables.filter(({ path }) => path.includes(search));
    if (targets.length > 1) {
        return {
            classes: ` class="mdsite-broken-link"`,
            href: "#",
            title: `${search} (ambiguous link)`,
        };
    }
    const target = targets[0];
    return target == null
        ? { classes: ` class="mdsite-broken-link"`, href: "#", title: search }
        : { classes: "", href: target.path, title: target.title };
}
