# Device codes, and why this path exists

## The problem it solves

The original way to get a company's skills onto a computer was the GitHub plugin
marketplace: add the company repository as a marketplace, install its plugins. That
works only for somebody whose GitHub account can read a private repository — in
practice the founder, and nobody else.

Most people who need the skills are not that person. A salesperson, a marketer or a
VA has no GitHub account and no reason to get one. Adding every teammate as a
repository collaborator to solve it would hand out write access to the company's
source of truth just to let somebody read a playbook.

A device code is the alternative: a credential Atlas issues to one member for one
computer, which can fetch the approved bundle and nothing else.

## What a device code is

- A string beginning `atlasd_`, shown **once** when it is created.
- Tied to one member of one company. It cannot read another company's skills.
- Read-only. It can download the approved bundle and report usage. It cannot edit
  skills, invite people, or see billing.
- Revocable, individually, at any time, by that member or an admin.
- Automatically dead when the person is removed from the company — access is
  re-checked on every download, not just when the code is created.

Because it is shown once, Atlas stores only a hash of it. Losing it is not a
problem: the person makes another. Recovering the original is impossible by design.

## Handling it safely

The code is a password. When helping somebody install:

- Pass it inline on the command that needs it, as `ATLAS_DEVICE_TOKEN=…`.
- Do not write it into a file, a note, a commit, a shell profile, or a summary.
- Do not repeat it back in chat. If you must refer to it, use the first few
  characters only — that prefix is what Atlas itself displays.
- If it has already been pasted somewhere it should not be, tell them to switch that
  device off in Atlas and create a new code. That is a ten-second fix.

The installer stores it on the computer it was run on, so later updates need no code
at all. That is deliberate: it means nobody has to keep a copy of it anywhere.

## What the installer does

1. Sends the code to Atlas and asks for the company's approved bundle.
2. Writes the bundle to `~/.atlas/<company>`, replacing any previous copy.
3. Copies the skills into the folder each supported tool already reads:
   - Claude Code — `~/.claude/skills`
   - Codex — `~/.codex/skills`
   - Cursor — `~/.cursor/skills`
4. For Claude Code, also tries to register the downloaded folder as a local plugin
   marketplace when that version of the CLI supports it, and falls back to the plain
   skills folder when it does not. Both work; the plugin route additionally shows
   version numbers under `/plugin`.
5. Removes the skill folders it wrote last time before writing the new ones, so a
   skill the company deleted disappears instead of lingering.

It does not install git, npm, Homebrew or any tool. It does not touch the company's
GitHub repository. It only writes inside the home directory.

## Failure states worth recognising

| Symptom | What it means | What to tell them |
| --- | --- | --- |
| `device code was turned off` | Somebody revoked this computer | Create a new code on the install page and run the command again |
| `device code has expired` | The code had an end date and passed it | Same: create a new one |
| `access has ended` | The company's Atlas access lapsed | Only an owner can fix this; installing is paused, existing files are untouched |
| `nothing has been published` | The company library has no skills yet | Only an owner can fix this; there is genuinely nothing to install |
| `no supported tool found` | None of the three tools are on this computer | The download worked; install a tool and re-run |
| Installs cleanly, Cursor still shows nothing | Cursor may be restricted to approved plugins | Check Cursor's settings for local skills/plugins being disabled |

Report these in the installer's own words. Each one has a different fix and a
different person who can apply it, so collapsing them into "install failed" removes
the only useful information in the message.
