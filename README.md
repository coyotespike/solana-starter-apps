# solana-starter-apps
A collection of apps building with Solana 

- in my head, you can add a git repo as a folder inside another git repo. It won't have its own URL but you can clone only the nested repo, and track its history independently of the first. However, outside my head, this is utterly impossible.
    - you can point to a commit in another repo: submodules
    - you can copy their code, and their commits into your single centralized .git: subtrees. 
        - If you don't delete the subtree repo, you can update it from your host repo with a specialized command to push over there.
        - Or you can delete the other repo and everything now lives here.
    - subrepo
        - like the other two but better
    - My goal was not to have a bunch of rando repos on my github. My only choice, therefore, is subtrees. Which means no cloning independently. Any user (that is, future me) who wants to create a new repo can use [filter-repo](https://docs.github.com/en/get-started/using-git/splitting-a-subfolder-out-into-a-new-repository)
