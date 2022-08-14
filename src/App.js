import './App.css';
import { useEffect, useState } from 'react';
import { Chart } from 'react-chartjs-2';
// eslint-disable-next-line no-unused-vars
import {Chart as ChartJS} from 'chart.js/auto';
import 'chartjs-adapter-moment';


const fetchPing = async (host) => {
    const res = await (await fetch(`http://localhost:3002/${host}`, {
        method: 'GET'
    })).json();
    return res;
}

const parseLatency = (latency) => {
    if (latency) {
        return Number(latency).toFixed(1) + ' ms';
    } else {
        return 'Not available';
    }
}

function App() {
    const options = {
        parsing: {
            yAxisKey: 'latency_ms',
            xAxisKey: 'timestamp'
        },
        scales: {
            x: {
                type: 'time',
                time: {
                    unit: 'seconds'
                }
            }
        },
        elements: {
            line: {
                fill: true
            }
        }
    }

    const handleHostChange = (evt) => {
        const newHost = evt.target.value;
        updateFormData({
            host: newHost,
        })
    }

    const submitHostChange = () => {
        updateState({
            host: formData['host'],
            aggregate: {},
            series: []
        })
    }

    const computeAggregate = (state, new_latency) => {
        const aggregate = state['aggregate'];
        const size = state['series'].length;
        if (!aggregate['mean']) {
            aggregate['mean'] = new_latency;
            aggregate['min'] = new_latency;
            aggregate['max'] = new_latency;
        } else {
            aggregate['mean'] = (aggregate['mean'] * size + new_latency) / (size + 1);
            aggregate['min'] = Math.min(aggregate['min'], new_latency);
            aggregate['max'] = Math.max(aggregate['max'], new_latency);
        }
        return aggregate;
    }

    const [state, updateState] = useState({
        host: 'google.com',
        aggregate: {},
        series: []
    });

    const [formData, updateFormData] = useState({
        host: 'google.com'
    })

    useEffect(() => {
        const interval = setInterval(() => {
            fetchPing(state['host']).then((val) => {
                const isAlive = val['alive'];
                if (isAlive) {
                    const ping = val['latency'];

                    updateState({
                        host: state['host'],
                        series: [...state['series'], { timestamp: new Date().getTime(), latency_ms: ping }],
                        aggregate: computeAggregate(state, ping)
                    });
                }
            }
        )}, 1000);
        return () => clearInterval(interval);
    });

    return (
        <div className="App">
            <main className="App-header">
                <p>Pinging {state['host']}</p>
                <p>Average latency: {parseLatency(state['aggregate']['mean'])}</p>
                <p>Max latency: {parseLatency(state['aggregate']['max'])}</p>
                <p>Min latency: {parseLatency(state['aggregate']['min'])}</p>

                <input type="text" value={formData['host']} onChange={handleHostChange} />
                <button type="button" onClick={submitHostChange}>Change host</button>

                <Chart
                    type='line'
                    options={options}
                    data={{ datasets: [{ data : state['series'], label: 'Latency (ms)' }], fill: true}}
                />
            </main>
        </div>
    );
}

export default App;
