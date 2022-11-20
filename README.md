# solana-starter-apps
A collection of apps building with Solana. These are all based on Buildspace tutorials!

## getting started
It's easy to run `npx create-solana-client <name> --initialize-keypair`. This was used for the `simple-script` repo, for instance. It creates a simple ts-node repo with dotenv and the solana libraries spl-token and web3.js already installed. Most of the others are basically create-react-app/NextJS repos.

## Structuring a monorepo

- in my head, you can add a git repo as a folder inside another git repo. It won't have its own URL but you can clone only the nested repo, and track its history independently of the first. However, **outside my head, this is utterly impossible**.
    - you can point to a commit in another repo: submodules
    - you can copy their code, and their commits into your single centralized .git: subtrees. 
        - If you don't delete the subtree repo, you can update it from your host repo with a specialized command to push over there.
        - Or you can delete the other repo and everything now lives here.
    - subrepo
        - like the other two but better
- My goal was not to have a bunch of rando repos on my github. My only choice, therefore, is subtrees. Which means no cloning independently. 
    - Any user (that is, future me) who wants to create a new repo can use [filter-repo](https://docs.github.com/en/get-started/using-git/splitting-a-subfolder-out-into-a-new-repository)
    - presumably you should not use --squash when creating the subtree, if you want to use filter-repo in future. Otherwise the git history will not be able to be recreated

You can use this like so:
`git subtree add --prefix <new-directory> git@github.com:<user/repo>.git <branch>`

With a local repo, you can do:
`git subtree add --prefix <new-directory> <path-to-directory> starter`

That way you can hack locally to your heart's content, and don't have to create a new remote git repo when done.

Of course, you can still run `npm i` and terminals locally! so it is a true monorepo
