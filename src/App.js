import './App.css';
import { useState } from 'react';
import { useForm, SubmitHandler} from "react-hook-form"

import {motion} from "motion/react"
import { animate } from 'motion';

function App() {
  const [m, setM] = useState(2); //sellers
  const [n, setN] = useState(3); // consumers
  const [costs, setCosts] = useState([]);//cost matrix
  const [supply, setSupply] = useState([]); // stockings
  const [demand, setDemand] = useState([]); // needing
  const [result, setResult] = useState(null); // result
  const [balanced, setBalanced] = useState(true);

  // create empty tables durning change m/n

  const handleMatrixInit = () => {
    setCosts(Array.from({length: m}, () => Array(n).fill(0)));
    setSupply(Array(m).fill(0));
    setDemand(Array(n).fill(0));
    setResult(null);
  };
  
  //Update cost 
  const handleCostChange = (i, j, value) => {
    const updated = costs.map((row) => [...row]);
    updated[i][j] = Number(value);
    setCosts(updated);
  };

  const handleSupplyChange = (i, value) => {
    const updated = [...supply];
    updated[i] = Number(value);
    setSupply(updated);
  };

  const handleDemandChange = (j, value) => {
    const updated = [...demand];
    updated[j] = Number(value);
    setDemand(updated);
  };

  const balanceSystem = () =>{
    const sumSupply = supply.reduce((a,b) => a + b, 0);
    const sumDemand = demand.reduce((a,b) => a + b, 0);
    let newCosts = costs.map((r) => [...r]);
    let newSupply = [...supply];
    let newDemand = [...demand];

    if(sumSupply > sumDemand){
      //add fictig supply 
      newDemand.push(sumSupply - sumDemand);
      newCosts.forEach((r) => r.push(0)); //cost for fictting 
      setBalanced(false);
    }
    else if (sumDemand > sumSupply){
      //add ficting supply

      newSupply.push(sumDemand - sumSupply);
      newCosts.push(Array(newDemand.length).fill(0));
      setBalanced(false);
    }
    return {newCosts, newSupply, newDemand};
  };

  // method of north east corner
  const northwestCorner  = () => {
    const {newCosts, newSupply, newDemand } = balanceSystem();

    const m = newSupply.length;
    const n = newDemand.length;
    const allocation = Array.from({length: m}, () => Array(n).fill(0));

    let i = 0;
    let j = 0;
    let supply = [...newSupply];
    let demand = [...newDemand];

    while (i < m && j < n){
      const x = Math.min(supply[i], demand[j]);
      allocation[i][j] = x;
      supply[i] -= x;
      demand[j] -= x;

      if(supply[i] === 0 && i < m -1) i++;
      else if (demand[j] === 0 && j < n -1) j++;
      else if (supply[i] === 0 && demand[j] === 0){
        i++;
        j++;
      }
    }
    const totalCost = allocation.reduce(
      (sum, row, r) => sum + row.reduce((acc, x, c) => acc + x* newCosts[r][c], 0),
      0
    );
    setResult({allocation , totalCost , balanced});
  };

  return (
    <div className="App" style={{ padding: "20px" }}>
      <h2>Метод северо-западного угла</h2>

      <div style={{ marginBottom: "10px" }}>
        <label>Поставщиков: </label>
        <input type="number" value={m} onChange={(e) => setM(+e.target.value)} />
        <label style={{ marginLeft: "10px" }}>Потребителей: </label>
        <input type="number" value={n} onChange={(e) => setN(+e.target.value)} />
        <button onClick={handleMatrixInit} style={{ marginLeft: "10px" }}>
          Создать таблицы
        </button>
      </div>

      {costs.length > 0 && (
        <>
          <h3>Введите данные</h3>
          <motion.table border="1" cellPadding="4" layoutId='underline' initial={{rotate: 90}} animate={{rotate: 0}}>
            <tbody>
              {costs.map((row, i) => (
                <tr key={i}>
                  {row.map((val, j) => (
                    <td key={j}>
                      <input
                        type="number"
                        value={val}
                        onChange={(e) => handleCostChange(i, j, e.target.value)}
                        style={{ width: "60px" }}
                      />
                    </td>
                  ))}
                  <td>
                    <input
                      type="number"
                      value={supply[i]}
                      onChange={(e) => handleSupplyChange(i, e.target.value)}
                      placeholder="Запас"
                    />
                  </td>
                </tr>
              ))}
              <tr>
                {demand.map((val, j) => (
                  <td key={j}>
                    <input
                      type="number"
                      value={val}
                      onChange={(e) => handleDemandChange(j, e.target.value)}
                      placeholder="Потр."
                    />
                  </td>
                ))}
                <td></td>
              </tr>
            </tbody>
          </motion.table>

          <button onClick={northwestCorner } style={{ marginTop: "10px" }}>
            Решить
          </button>
        </>
      )}

      {result && (
        <>
          <h3>Результат</h3>
          {!balanced && <p style={{ color: "orange" }}>Добавлен фиктивный поставщик/потребитель</p>}
          <motion.table border="1" cellPadding="4"  initial={{scale: 0}} animate={{scale: 1}} >
            <tbody>
              {result.allocation.map((row, i) => (
                <tr key={i}>
                  {row.map((val, j) => (
                    <td key={j}>{val}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </motion.table >
          <p>
            <b>Общая стоимость:</b> {result.totalCost}
          </p>
        </>
      )}
    </div>
  );
}

export default App;
