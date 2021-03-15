# kdiff

Kicad Diff

This repo is a test to have a more complete diff tool for Kicad.
It uses [Kicad-Diff](https://github.com/Gasman2014/KiCad-Diff) to generate layout diffs and [Plotgitsh](https://github.com/jnavila/plotkicadsch) to generate schematic diffs.

# Dependencies
These tools have to be in the $PATH
- [Kicad-Diff](https://github.com/Gasman2014/KiCad-Diff)
- [Plotgitsh](https://github.com/jnavila/plotkicadsch)

## Usage

```
$> cd kdiff
kdiff $> source env.sh
cd ../kicad_git_repo
kicad_git_repo $> kdiff board.kicad_pcb
```
