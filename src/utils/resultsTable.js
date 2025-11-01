import React from "react";


/*
 * Displays a list of advice or feedback messages.
*/
export function AdviceSection({ adviceList, title = "Advice" }) {
  return (
    <div className="adviceSection">
      <h3>{title}</h3>
      <ul>
        {adviceList.map((ad, i) => (
          <li key={i}>{ad}</li>
        ))}
      </ul>
    </div>
  );
}

export function createResultsTable({ results, columns, adviceList, rowKey}) {
  const table = (
    <div className="results-table-container">
      <table className="results-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {results.map((row) => {
            const key = row[rowKey]
            return (
              <tr key={key}>
                {columns.map((col) => (
                  <td key={col.key}>{row[col.key]}</td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
  return (
    <>
      {table}
      <AdviceSection adviceList={adviceList} />
    </>
  );
}




export function createResultsTableGame1({ phaseScores, results, adviceList }) {
  const phases = ["start", "middle", "end"];

  const columns = [
    { key: "phase", label: "Phase" },
    { key: "stars", label: "Stars" },
    { key: "rightAngle", label: "Right Angle (°)" },
    { key: "leftAngle", label: "Left Angle (°)" },
    { key: "rightRange", label: "Right Range" },
    { key: "leftRange", label: "Left Range" },
  ];

  const rows = phases.map((phase) => ({
    phase,
    stars: phaseScores[phase],
    rightAngle: results?.right?.[phase]?.maxAngle ?? "N/A",
    leftAngle: results?.left?.[phase]?.maxAngle ?? "N/A",
    rightRange: results?.right?.[phase]?.excursion ?? "N/A",
    leftRange: results?.left?.[phase]?.excursion ?? "N/A",
  }));

  const table = (
    <div className="results-table-container">
      <table className="results-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.phase}>
              {columns.map((col) => (
                <td key={col.key}>{row[col.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
  return (
    <>
      {table}
      <AdviceSection adviceList={adviceList} />
    </>
  );
}