# Final Submission Checklist

## Files and identity

- [x] `src/config/site.ts` displays **Jacob Fenollar** and **22421357**.
- [x] The configured repository URL is `https://github.com/Shadovv909/cse3cwa-assessment-1`.
- [x] The final ZIP excludes `node_modules`, `.next`, `.git`, and TypeScript cache files.
- [x] A Git bundle is supplied separately as a backup of the prepared local commit history.

## Final technical check

Run from the project folder:

```bash
npm ci
npm run check
npm audit --omit=dev
```

Then open both files in `examples/` directly in a normal browser and complete one activity in each.

## GitHub repository

A GitHub repository link is required by the submission brief. The local project is prepared with `main`, an `origin` URL, professional commits, `.gitignore`, and GitHub Actions. The remote repository cannot be created or pushed without the account holder’s authenticated GitHub session.

After extracting the ZIP, run:

```bash
./scripts/publish-to-github.sh
```

Complete the one-time browser sign-in when GitHub CLI asks. Confirm the repository is public and that the Actions check passes, then submit:

```text
https://github.com/Shadovv909/cse3cwa-assessment-1
```

Do not send or store a GitHub password or personal access token in the project.

## Mandatory video walkthrough

The rubric submission note requires a video that shows the student ID, face, and voice while demonstrating the application. Record this personally; another person or automated narration cannot satisfy that identity requirement. Follow `docs/VIDEO_WALKTHROUGH_SCRIPT.md` and show:

- student card or ID clearly enough to verify the number;
- face and spoken introduction;
- five required pages and responsive navigation;
- theme and spacing persistence;
- a solved phoneme Wordle with hover hint;
- a found Word Search sequence;
- generation and opening of each standalone HTML file;
- project structure, tests, GitHub repository, and successful Actions run.

## Items to submit

- [ ] Final project ZIP.
- [ ] Working public GitHub repository link.
- [ ] Required video walkthrough in the format/location specified by the subject submission system.
- [ ] Any declaration or cover sheet required by the learning management system.
