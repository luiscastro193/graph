# Graph drawer

## Notation

### gto

Creates an edge between two nodes

```
Node 1 gto Node 2 gto Node 3
Node 3 gto Success
```

### gand

Creates multiple edges simultaneously

```
Node 1 gand Node 2 gand Node 3 gto A gand B
```

### gsame

Forces nodes to be placed on the same rank

```
A gto B gto C gto D
A gsame B gsame C
```

### gconstraint

Edge is not used in ranking the nodes

```
Something gto Another thing gconstraint
Something gand Another Thing gto That thing
```

### Note

Don't use double quotes `"`

## Graphviz configuration

```gv
strict digraph {

graph [rankdir = "LR"];
graph [nodesep = 0.5];
node [fontname = "Helvetica"];
node [fontsize = 11];
node [shape = box];
node [width = 0];
node [height = 0];
node [margin = 0.1];

}
```
