# Kicad Diff

This repo is a test to have a more complete diff tool for Kicad.
It uses [Kicad-Diff](https://github.com/Gasman2014/KiCad-Diff) to generate layout diffs and [Plotgitsh](https://github.com/jnavila/plotkicadsch) to generate schematic diffs.

It is currently supporting Kicad projects that use GIT only.

# Dependencies
These tools have to be in the $PATH
- [Kicad-Diff](https://github.com/Gasman2014/KiCad-Diff)
- [Plotgitsh](https://github.com/leoheck/plotkicadsch)

# Installing dependecies
```
# Custom plotgitsch
hg clone leoheck/plotkicadsch
cd plotkicadsch
./install.sh

# Kicad Diff
hg clone Gasman2014/KiCad-Diff
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
