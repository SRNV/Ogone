enum HTMLDocument {
    PAGE = `
    <html>
        <head>
            {% head %}
        </head>
        <body>
            {% dom %}
            {% script %}
        </body>
    </html>
    `,
    PAGE_BUILD = `
    <html>
        <head>
            {% head %}
        </head>
        <body>
            {% dom %}
            {% script %}
        </body>
    </html>
    `
}
export default HTMLDocument;