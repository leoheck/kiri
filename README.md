# Kicad Diff

This repo is a test to have a more complete diff tool for Kicad.
It uses [Kicad-Diff](https://github.com/Gasman2014/KiCad-Diff) to generate layout diffs and [Plotgitsh](https://github.com/jnavila/plotkicadsch) to generate schematic diffs.

It is currently supporting Kicad projects that use GIT.

# Dependencies

These tools have to be in the `$PATH`
- [Plotgitsh](https://github.com/leoheck/plotkicadsch)
- [Kicad-Diff](https://github.com/Gasman2014/KiCad-Diff)

## Installing dependecies
```
# Custom plotgitsch
hg clone leoheck/plotkicadsch
cd plotkicadsch
./install.sh

# Kicad Diff
hg clone Gasman2014/KiCad-Diff

# On OSX
brew install gsed
brew install findutils
```

## Setup
```
gh repo clone leoheck/kdiff
cd kdiff
source env.sh
```

## Using
```
cd [kicad_git_repo]
kdiff board.kicad_pcb
```

## Command line flags (Help)

How to access tool help, this may change, so prefer to use `kdiff -h` instead.

```
➜ kdiff -h                

USAGE :

    kdiff [OPTIONS] KICAD_PCB

OPTIONS:

    -a          Track all commits (slower). By default it looks only commits related with *.kicad_pcb and *.sch files
    -o HASH     Show commits starting from this one - This HASH is the short version
    -n HASH     Show commits until this one delimited by this one - This HASH is the short version
    -r          Remove kidiff folder before run
    -l          Do not launch browser at the end
    -w VIEWER   Change default page viewer
    -v          Verbose
    -h          This help

EXAMPLES:

    # Kicad project on the root of the repo
    kdiff board.kicad_pcb

    # Nested Kicad projects
    kdiff my_kicad_project/board.kicad_pcb -r -v
```

## Examples

Schematic view, assets generated using Plotkicadsch

<p align="center">
	<img src="misc/sch.png" width="820" alt="sch">
</p>

Layout view, assets generated using Kicad-Diff

<p align="center">
	<img src="misc/pcb.png" width="820" alt="pcb">
</p>

[![Demo](misc/sch.png)](https://youtu.be/PMC0USSsbDE)
