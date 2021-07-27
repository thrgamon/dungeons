import './App.css';
import { useState, ChangeEvent, MouseEvent } from 'react';
import ForceGraph2D, {NodeObject} from 'react-force-graph-2d';

// The size of a node should be the value of all the links pointing to it

type Node = NodeObject & {
  name?: string,
  val?: number,
  data?: any
}

const node1 : Node = {
  "id": "1",
  "name": "name1",
  "val": 1
}

const node2 : Node = {
  "id": "2",
  "name": "name2",
  "val": 2
}

const myData = {
    "nodes": [node1, node2],
    "links": [
        {
            "source": node1.id,
            "target": node2.id
        }
    ]
}
function App() {
  const [graphData, setGraphData] = useState(myData);
  const [currentNode, setCurrentNode] = useState(myData["nodes"][0]);

  const addNode = (name: string) => {
    const currentNodeId = currentNode.id
    const nodeName = name
    const {nodes, links} = graphData
    const newNodes = nodes.slice();
    const newLinks = links.slice();

    let newNode = {
      id: nodeName,
      name: nodeName,
      val: 1
    }

    let newLink = {
      target: name,
      source: currentNodeId
    }
console.log(newNode)
    console.log(newLink)
    console.log(graphData)
    setGraphData({ nodes: [...newNodes, newNode], links: [...newLinks, newLink] });
  }

  const deleteNode = (event: MouseEvent<HTMLButtonElement>) => {
    const {nodes, links} = graphData
    const nodeId = event.currentTarget.name
    const nodeIdx = getNodeIdxByID(nodeId)
    const node = getNodeByID(nodeId)
    const newLinks = links.filter(l => l.source !== node && l.target !== node); // Remove links attached to node
    const newNodes = nodes.slice();
    newNodes.splice(nodeIdx, 1); // Remove node
    // newNodes.forEach((n, idx) => { n.id = idx; }); // Reset node ids to array index

    setGraphData({ nodes: newNodes, links: newLinks });
    event.preventDefault()
  }

  const getNodeByID = (nodeID: string) => {
    return graphData["nodes"].find(el => el.id === nodeID)
  }

  const getNodeIdxByID = (nodeID: string) => {
    return graphData["nodes"].findIndex(el => el.id === nodeID)
  }

  const updateNode = (nodeId: string, value: string) => {
    const {nodes, links} = graphData
    let newNodes = nodes.slice();

    const targetNodeIdx = newNodes.findIndex(el => el.id === nodeId)
    const targetNode = newNodes[targetNodeIdx]
    newNodes.splice(targetNodeIdx, 1)
    targetNode["data"] = value

    setGraphData({ nodes: [...newNodes, targetNode], links: links});

    const re = /\[\[(.*?)\]\]/g
    // We would have to change a compiler option to ignore a warning and CBA
    // @ts-ignore
    const matches = [...value.matchAll(re)]
    matches.forEach(match => {
      const name = match[1]
      const targetNode = newNodes.find(el => el.id === name)
      if (targetNode === undefined) {
        addNode(name)
      }
    })
  }

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const value = event.target.value;
    const nodeId = event.target.name;
    updateNode(nodeId, value)
  }

  const setNode = (node: Node) => {
    setCurrentNode(node)
  }

  return (
    <div className="container">
      <ForceGraph2D
        graphData={graphData}
        onNodeClick={setNode}
      />
      <div className="overlay">
        <h2>{String(currentNode.id)}</h2>
        <textarea name={String(currentNode.id)} onChange={handleChange} value={currentNode.data || ""}/>
      <button name={String(currentNode.id)} onClick={deleteNode}>
        deleteNode
      </button>
      </div>
    </div>
  );
}

export default App;
