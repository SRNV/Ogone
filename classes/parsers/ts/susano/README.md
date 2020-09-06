<p align="center">

  <img src="https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/c904a5f7-a917-4b2b-8929-bfd2b8748c4a/d6v8gqp-9b5fe52e-a717-4bfa-9f74-bf02a75acad9.gif?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOiIsImlzcyI6InVybjphcHA6Iiwib2JqIjpbW3sicGF0aCI6IlwvZlwvYzkwNGE1ZjctYTkxNy00YjJiLTg5MjktYmZkMmI4NzQ4YzRhXC9kNnY4Z3FwLTliNWZlNTJlLWE3MTctNGJmYS05Zjc0LWJmMDJhNzVhY2FkOS5naWYifV1dLCJhdWQiOlsidXJuOnNlcnZpY2U6ZmlsZS5kb3dubG9hZCJdfQ.LzlbkHBzK1HfxhznSqhw8r6NssbYhPofVUle3Xe5Ye8">

</p>

<h1 align="center">Susano</h1>

<p align="center">bundler for Ogone production</p>

## Overview
- three shaking by default
- uglify by default

## Examples


- \w a path:

    ```ts

        const susano = new Susano();

        susano.release({

        path: './deps.ts',

        });

    ```
- \w code:

    ```ts

        const susano = new Susano();

        susano.release({

            path: './mod.ts',

            code: `

                import * as deps rom './deps.ts';

                console.warn(deps);

            `,

        });

    ```