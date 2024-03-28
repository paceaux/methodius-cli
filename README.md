# Methodius CLI (an N-gram utility)

Methodius A utility for analyzing frequency of text in chunks.

This CLI lets you do it from the command line.

[![Hippocratic License HL3-LAW-MEDIA-MIL-SOC-SV](https://img.shields.io/static/v1?label=Hippocratic%20License&message=HL3-LAW-MEDIA-MIL-SOC-SV&labelColor=5e2751&color=bc8c3d)](https://firstdonoharm.dev/version/3/0/law-media-mil-soc-sv.html)

![npm](https://img.shields.io/npm/dm/methodius)

## Installation

### Prerequisites

- Node LTS (as of September 2023, Node 18.16.0)


### Running on-demand

Download this package. Then run

```shell
npm install
```

### Globally via NPM

```shell
npm i -g methodius-cli
```

## Usage

### Basic Scanning

Get all the details:

```shell
methodius -f "great-expectations.txt"
```

Decide what properties you'd like to see:
(use `-p` for each property you want to see)

```shell
methodius -f "great-expectations.txt" -p "uniqueWords" -p "uniqueBigrams" -p letterFrequencies
```

Do the same on multiple files
```shell
methodius -f "great-expectations.txt" "a-tale-of-two-cities.txt" -p "uniqueWords" -p "uniqueBigrams" -p letterFrequencies
```

Set your own output file
```shell
methodius -f "great-expectations.txt" "a-tale-of-two-cities.txt" -p "uniqueWords" -o uniqueWords 
```


### Options

| Option | Alias | Description   | Defaults  |
|---|---|---|---|
| `--files` |`-f`  | fully qualified path to a file Required. | `samples/alice.txt` |
| `--topLimit` |`-l`  | for any methods, this sets the number of top-ngrams to get. Optional. | `15` |
| `--properties` | `-p`  |  which properties to return. Optional. | `'bigramFrequencies','trigramFrequencies','letterFrequencies','meanWordSize',  'medianWordSize','wordFrequencies','bigramPositions','trigramPositions',  'uniqueWords'` |
| `--topMethods` | `-s`  |  which "top" methods to use. optional. |  `'topBigrams', 'topTrigrams','topWords',`|
| `--outputFileName` | `-o`  | name of the output file. Optional. | `analysis.json` or `<inputfilename>.analysis.json` if multiple files  |
| `--mergeResults`| `-m`  | Merges the results files. output will be `.merged.json` . Optional. | `false`|

