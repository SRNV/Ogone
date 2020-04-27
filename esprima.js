const a = require('acorn');


const prog = `
users: { res.rows };
`;
const parsed = a.tokenizer(prog);
// console.warn(parsed.body[0].declarations[0].id.properties);
for (let tokens of parsed) {
  console.warn(tokens);
}