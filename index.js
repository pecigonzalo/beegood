module.exports = app => {
  // Opens a PR every time someone installs your app for the first time
  app.on('installation.created', check)
  async function check(context) {
    // shows all repos you've installed the app on
    console.log(context.payload.repositories)

    const owner = context.payload.installation.account.login
    context.payload.repositories.forEach(async (repository) => {
      const repo = repository.name
      const defaultBranch = repository.default_branch

      // Generates a random number to ensure the git reference isn't already taken
      // NOTE: this is not recommended and just shows an example so it can work :)

      // test
      const branch = `beegood/${Math.floor(Math.random() * 9999)}`

      // Get current reference in Git
      const reference = await context.github.gitdata.getReference({
        repo, // the repo
        owner, // the owner of the repo
        ref: default_branch
      })
      // Create a branch
      await context.github.gitdata.createReference({
        repo,
        owner,
        ref: `refs/heads/${branch}`,
        sha: reference.data.object.sha // accesses the sha from the heads/master reference we got
      })
      // create a new file
      await context.github.repos.createFile({
        repo,
        owner,
        path: 'path/to/your/file.md', // the path to your config file
        message: 'adds config file', // a commit message
        content: Buffer.from('My new file is awesome!').toString('base64'),
        // the content of your file, must be base64 encoded
        branch // the branch name we used when creating a Git reference
      })
      // create a PR from that branch with the commit of our added file
      await context.github.pullRequests.create({
        repo,
        owner,
        title: 'Update repository templates :honeybee:', // the title of the PR
        head: branch, // the branch our chances are on
        base: defaultBranch, // the branch to which you want to merge your changes
        body: 'Hey! It seems your are missing some of our standard files, let me fix that for you.', // the body of your PR,
        maintainer_can_modify: true // allows maintainers to edit your app's PR
      })
    })
  }
}
