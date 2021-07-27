import logo from './logo.svg';
import './App.css';
import { useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

const myData = {
    "nodes": [
        {
          "id": "1",
          "name": "name1",
          "val": 1
        },
        {
          "id": "2",
          "name": "name2",
          "val": 10
        }
    ],
    "links": [
        {
            "source": "1",
            "target": "2"
        }
    ]
}
function App() {
  const [graphData, setGraphData] = useState(myData);
  const [currentNode, setCurrentNode] = useState(myData["nodes"][0]);

  const addNode = () => {
    const {nodes, links} = graphData
    const newNodes = nodes.slice();
    const currentNodeId = currentNode.id

    let newNode = {
      id: currentNodeId
    }

    setCurrentNode(currentNode + 1)
    setGraphData({ nodes: [...newNodes, newNode], links: links });
  }

  const updateNode = (node, value) => {
    const {nodes, links} = graphData
    let newNodes = nodes.slice();
    const newLinks = links.slice();

    const targetNodeIdx = newNodes.findIndex(el => el.id === node)
    const targetNode = newNodes[targetNodeIdx]
    newNodes.splice(targetNodeIdx, 1)
    targetNode["cal"] = value
    setGraphData({ nodes: [...newNodes, targetNode], links: links});
  }

  const handleChange = (event) => {
    const value = event.target.value;
    const node = event.target.name;
    updateNode(node, value)
  }

  const setNode = (node, event) => {
    setCurrentNode(node)
  }

  return (
    <div class="container">
      <ForceGraph2D
        graphData={graphData}
        onNodeClick={setNode}
      />
      <div class="overlay">
        <h2>{String(currentNode.id)}</h2>
        <textarea name={String(currentNode.id)} onChange={handleChange} value={currentNode.cal || ""}/>
      <button onClick={addNode}>
        Add Node
      </button>
      </div>
    </div>
  );
}

export default App;
