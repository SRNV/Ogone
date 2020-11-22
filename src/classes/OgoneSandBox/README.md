# Ogone SandBox
Ogone SandBox creates a folder at the same level of the current working directory,
so basically if Deno is running in `/home/app`, Ogone SandBox will create `/home/.ogone`

all the files, excepted `tsconfig.json | .git/* | .vscode/* | node_modules/*` are copied into this sandbox.
this sandbox allows a better resolution of the imported components.