enum HTMLDocument {
    PAGE = `
    <html>
        <head>
            {% head %}
            {% script %}
        </head>
        <body>
            {% dom %}
        </body>
    </html>
    `
}
export default HTMLDocument;