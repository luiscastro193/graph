# Graph drawer

## Notation

### gto

Creates an edge between two nodes

```text
Node 1 gto Node 2 gto Node 3
Node 2 gto Success
```

[Live demo](https://luiscastro193.github.io/graph/#eJzzy09JVTBUSC_JV_ADMY0QTGMuJJHg0uTk1OJiAFsmDuI)

### gand

Creates multiple edges simultaneously

```text
Node 1 gand Node 2 gand Node 3 gto A gand B
```

[Live demo](https://luiscastro193.github.io/graph/#eJzzy09JVTBUSE_MS1HwA7GNkNjGCukl-QqOEBEnACUDDSQ)

### gsame

Forces nodes to be placed on the same rank

```text
A gto B gto C gto D
A gsame B gsame C
```

[Live demo](https://luiscastro193.github.io/graph/#eJxzVEgvyVdwApPOYNKFy1EhvTgxNxUkCqadAc9nCxM)

### gconstraint

Edge is not used in ranking the nodes

```text
Something gto Another thing gconstraint
Something gand Another thing gto That thing
```

[Live demo](https://luiscastro193.github.io/graph/#eJwLzs9NLcnIzEtXSC_JV3DMyy_JSC1SgIok5-cVlxQlZuaVcAUj1CXmpaArBGoNyUgsgXABIVwfAg)

### Notes

Don't use double quotes `"`.

Use `\n` to split text in two or more lines.

## [Graphviz](https://graphviz.org/) configuration

```dot
strict digraph {

graph [rankdir = "LR"];
graph [nodesep = 0.5];
node [fontname = "InterVariable"];
node [fontsize = 12];
node [shape = box];
node [width = 0];
node [height = 0];
node [margin = 0.1];

}
```
