# Querying Odoo database with AI and RAG
> [!WARNING]
> This module is purely experimental and for educational purpose use only.
>
> Do not use it in any environment but in an experimental one, definitely not in a production environment.
>
> I'm not responsible for any damage or harm by the use of anything from this repo.
>
> Use it at your own risk.

> [!CAUTION]
> AI might generate queries that negatively impact your data.
>
> Do not use this module unless you have reviewed the source codes thoroughly, understand what it does and in an experimental environment.

> [!IMPORTANT]
> This experiment uses modified LocalAI because at the time this experiment started, LocalAI didn't implement embedding function with llama.cpp backend yet.
> 
> Please see [my LocalAI fork](https://github.com/yonitjio/LocalAI) for the modification.


In this experiment we're going to try a technique called Retrieval Augmented Generation or RAG.

With RAG, we can dynamically add information regarding Odoo database. So in theory we can query any data from the database.

Please watch this video for more details:

[![EXPLORING_ODOO](https://img.youtube.com/vi/4ixLuLNDYrU/0.jpg)](https://www.youtube.com/watch?v=4ixLuLNDYrU)
