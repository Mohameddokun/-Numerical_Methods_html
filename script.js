// DOM Elements
const equationInput = document.getElementById('equation');
const toleranceInput = document.getElementById('tolerance');
const maxIterationsInput = document.getElementById('maxIterations');
const methodSelect = document.getElementById('method');
const methodParamsContainer = document.getElementById('methodParams');
const calculateBtn = document.getElementById('calculateBtn');
const resultsOutput = document.getElementById('resultsOutput');
const plotContainer = document.getElementById('plotContainer');
const comparisonOutput = document.getElementById('comparisonOutput');
const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');
const loadingResults = document.getElementById('loadingResults');
const loadingComparison = document.getElementById('loadingComparison');

// Initialize method parameters UI
function initMethodParams() {
    methodParamsContainer.innerHTML = '';
    
    const method = methodSelect.value;
    
    if (method === 'all') {
        // Show parameters for all methods
        methodParamsContainer.innerHTML = `
            <h4>All Methods Parameters</h4>
            <div class="param-row">
                <div>
                    <label for="bisectionA">Bisection: a</label>
                    <input type="number" id="bisectionA" value="-2" step="0.1">
                </div>
                <div>
                    <label for="bisectionB">Bisection: b</label>
                    <input type="number" id="bisectionB" value="3" step="0.1">
                </div>
            </div>
            <div class="param-row">
                <div>
                    <label for="falsePositionA">False Position: a</label>
                    <input type="number" id="falsePositionA" value="-2" step="0.1">
                </div>
                <div>
                    <label for="falsePositionB">False Position: b</label>
                    <input type="number" id="falsePositionB" value="3" step="0.1">
                </div>
            </div>
            <div class="param-row">
                <div>
                    <label for="fixedPointX0">Fixed Point: x₀</label>
                    <input type="number" id="fixedPointX0" value="2" step="0.1">
                </div>
                <div>
                    <label for="fixedPointG">Fixed Point: g(x)</label>
                    <input type="text" id="fixedPointG" value="(2*x + 5)^(1/3)">
                </div>
            </div>
            <div class="param-row">
                <div>
                    <label for="newtonX0">Newton-Raphson: x₀</label>
                    <input type="number" id="newtonX0" value="2" step="0.1">
                </div>
            </div>
            <div class="param-row">
                <div>
                    <label for="secantX0">Secant: x₀</label>
                    <input type="number" id="secantX0" value="2" step="0.1">
                </div>
                <div>
                    <label for="secantX1">Secant: x₁</label>
                    <input type="number" id="secantX1" value="3" step="0.1">
                </div>
            </div>
        `;
        methodParamsContainer.classList.add('active');
    } else if (method === 'bisection') {
        methodParamsContainer.innerHTML = `
            <h4>Bisection Method Parameters</h4>
            <div class="param-row">
                <div>
                    <label for="bisectionA">a (lower bound)</label>
                    <input type="number" id="bisectionA" value="-2" step="0.1">
                </div>
                <div>
                    <label for="bisectionB">b (upper bound)</label>
                    <input type="number" id="bisectionB" value="3" step="0.1">
                </div>
            </div>
        `;
        methodParamsContainer.classList.add('active');
    } else if (method === 'falsePosition') {
        methodParamsContainer.innerHTML = `
            <h4>False Position Method Parameters</h4>
            <div class="param-row">
                <div>
                    <label for="falsePositionA">a (lower bound)</label>
                    <input type="number" id="falsePositionA" value="-2" step="0.1">
                </div>
                <div>
                    <label for="falsePositionB">b (upper bound)</label>
                    <input type="number" id="falsePositionB" value="3" step="0.1">
                </div>
            </div>
        `;
        methodParamsContainer.classList.add('active');
    } else if (method === 'fixedPoint') {
        methodParamsContainer.innerHTML = `
            <h4>Fixed Point Iteration Parameters</h4>
            <div class="param-row">
                <div>
                    <label for="fixedPointX0">Initial guess (x₀)</label>
                    <input type="number" id="fixedPointX0" value="2" step="0.1">
                </div>
                <div>
                    <label for="fixedPointG">g(x) for x = g(x)</label>
                    <input type="text" id="fixedPointG" value="(2*x + 5)^(1/3)">
                </div>
            </div>
        `;
        methodParamsContainer.classList.add('active');
    } else if (method === 'newtonRaphson') {
        methodParamsContainer.innerHTML = `
            <h4>Newton-Raphson Method Parameters</h4>
            <div class="param-row">
                <div>
                    <label for="newtonX0">Initial guess (x₀)</label>
                    <input type="number" id="newtonX0" value="2" step="0.1">
                </div>
            </div>
        `;
        methodParamsContainer.classList.add('active');
    } else if (method === 'secant') {
        methodParamsContainer.innerHTML = `
            <h4>Secant Method Parameters</h4>
            <div class="param-row">
                <div>
                    <label for="secantX0">First initial guess (x₀)</label>
                    <input type="number" id="secantX0" value="2" step="0.1">
                </div>
                <div>
                    <label for="secantX1">Second initial guess (x₁)</label>
                    <input type="number" id="secantX1" value="3" step="0.1">
                </div>
            </div>
        `;
        methodParamsContainer.classList.add('active');
    } else {
        methodParamsContainer.classList.remove('active');
    }
}

// Tab switching
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const tabName = tab.getAttribute('data-tab');
        
        // Update active tab
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Update active content
        tabContents.forEach(content => {
            content.classList.remove('active');
            if (content.id === `${tabName}Content`) {
                content.classList.add('active');
            }
        });
    });
});

// Root finding algorithms
class RootFinder {
    constructor(equation, tolerance, maxIterations) {
        this.equation = equation;
        this.tolerance = tolerance;
        this.maxIterations = maxIterations;
        
        // Compile the function for evaluation
        try {
            this.f = math.compile(equation);
        } catch (error) {
            throw new Error(`Error compiling equation: ${error.message}`);
        }
    }
    
    evaluate(x) {
        try {
            return this.f.evaluate({x: x});
        } catch (error) {
            throw new Error(`Error evaluating function at x=${x}: ${error.message}`);
        }
    }
    
    bisection(a, b) {
        const iterations = [];
        let root = null;
        let errorMessage = null;
        
        // Check if f(a) and f(b) have opposite signs
        const fa = this.evaluate(a);
        const fb = this.evaluate(b);
        
        if (fa * fb >= 0) {
            errorMessage = "Error: f(a) and f(b) must have opposite signs for bisection method.";
            return { iterations, root, errorMessage };
        }
        
        for (let i = 0; i < this.maxIterations; i++) {
            const c = (a + b) / 2;
            const fc = this.evaluate(c);
            
            // Calculate approximate error (for iterations after the first)
            let error = (i > 0) ? Math.abs((c - iterations[i-1].root) / c) * 100 : null;
            
            iterations.push({
                iteration: i + 1,
                a: a,
                b: b,
                root: c,
                f_root: fc,
                error: error
            });
            
            if (Math.abs(fc) < this.tolerance || Math.abs(b - a) < this.tolerance) {
                root = c;
                break;
            }
            
            if (fa * fc < 0) {
                b = c;
            } else {
                a = c;
            }
        }
        
        return { iterations, root, errorMessage };
    }
    
    falsePosition(a, b) {
        const iterations = [];
        let root = null;
        let errorMessage = null;
        
        // Check if f(a) and f(b) have opposite signs
        const fa = this.evaluate(a);
        const fb = this.evaluate(b);
        
        if (fa * fb >= 0) {
            errorMessage = "Error: f(a) and f(b) must have opposite signs for false position method.";
            return { iterations, root, errorMessage };
        }
        
        let prevC = null;
        
        for (let i = 0; i < this.maxIterations; i++) {
            const fa = this.evaluate(a);
            const fb = this.evaluate(b);
            const c = (a * fb - b * fa) / (fb - fa);
            const fc = this.evaluate(c);
            
            // Calculate approximate error
            let error = (prevC !== null) ? Math.abs((c - prevC) / c) * 100 : null;
            prevC = c;
            
            iterations.push({
                iteration: i + 1,
                a: a,
                b: b,
                root: c,
                f_root: fc,
                error: error
            });
            
            if (Math.abs(fc) < this.tolerance) {
                root = c;
                break;
            }
            
            if (fa * fc < 0) {
                b = c;
            } else {
                a = c;
            }
        }
        
        return { iterations, root, errorMessage };
    }
    
    fixedPoint(x0, gFunction) {
        const iterations = [];
        let root = null;
        let errorMessage = null;
        
        // Compile g(x)
        let g;
        try {
            g = math.compile(gFunction);
        } catch (error) {
            errorMessage = `Error compiling g(x): ${error.message}`;
            return { iterations, root, errorMessage };
        }
        
        let prevX = x0;
        
        for (let i = 0; i < this.maxIterations; i++) {
            let xNew;
            try {
                xNew = g.evaluate({x: prevX});
            } catch (error) {
                errorMessage = `Error evaluating g(x) at x=${prevX}: ${error.message}`;
                return { iterations, root, errorMessage };
            }
            
            // Calculate approximate error
            let error = (i > 0) ? Math.abs((xNew - prevX) / xNew) * 100 : null;
            
            iterations.push({
                iteration: i + 1,
                x_i: prevX,
                x_i1: xNew,
                g_x: xNew,
                error: error
            });
            
            if (Math.abs(xNew - prevX) < this.tolerance) {
                root = xNew;
                break;
            }
            
            prevX = xNew;
        }
        
        return { iterations, root, errorMessage };
    }
    
    newtonRaphson(x0) {
        const iterations = [];
        let root = null;
        let errorMessage = null;
        
        // We'll use a numerical derivative since math.js doesn't have symbolic differentiation
        const h = 1e-8; // Small value for numerical differentiation
        
        let xPrev = x0;
        
        for (let i = 0; i < this.maxIterations; i++) {
            try {
                const fVal = this.evaluate(xPrev);
                const fPrimeVal = (this.evaluate(xPrev + h) - this.evaluate(xPrev - h)) / (2 * h);
                
                if (Math.abs(fPrimeVal) < 1e-15) {
                    errorMessage = "Error: Derivative too close to zero in Newton-Raphson method.";
                    return { iterations, root, errorMessage };
                }
                
                const xNew = xPrev - fVal / fPrimeVal;
                
                // Calculate approximate error
                let error = (i > 0) ? Math.abs((xNew - xPrev) / xNew) * 100 : null;
                
                iterations.push({
                    iteration: i + 1,
                    x_i: xPrev,
                    x_i1: xNew,
                    f_x: fVal,
                    f_prime_x: fPrimeVal,
                    error: error
                });
                
                if (Math.abs(xNew - xPrev) < this.tolerance) {
                    root = xNew;
                    break;
                }
                
                xPrev = xNew;
            } catch (error) {
                errorMessage = `Error in iteration ${i+1}: ${error.message}`;
                return { iterations, root, errorMessage };
            }
        }
        
        return { iterations, root, errorMessage };
    }
    
    secant(x0, x1) {
        const iterations = [];
        let root = null;
        let errorMessage = null;
        
        let xPrev2 = x0;
        let xPrev1 = x1;
        
        // First iteration
        iterations.push({
            iteration: 1,
            x_i1: xPrev2,
            x_i: xPrev1,
            x_i1_next: '-',
            f_x_i1: this.evaluate(xPrev2),
            f_x_i: this.evaluate(xPrev1),
            error: '-'
        });
        
        for (let i = 1; i < this.maxIterations; i++) {
            try {
                const fPrev2 = this.evaluate(xPrev2);
                const fPrev1 = this.evaluate(xPrev1);
                
                if (Math.abs(fPrev1 - fPrev2) < 1e-15) {
                    errorMessage = "Error: Division by zero in secant method.";
                    return { iterations, root, errorMessage };
                }
                
                const xNew = xPrev1 - fPrev1 * (xPrev1 - xPrev2) / (fPrev1 - fPrev2);
                
                // Calculate approximate error
                const error = Math.abs((xNew - xPrev1) / xNew) * 100;
                
                iterations.push({
                    iteration: i + 1,
                    x_i1: xPrev1,
                    x_i: xNew,
                    x_i1_next: '-',
                    f_x_i1: fPrev1,
                    f_x_i: this.evaluate(xNew),
                    error: error
                });
                
                if (Math.abs(xNew - xPrev1) < this.tolerance) {
                    root = xNew;
                    break;
                }
                
                xPrev2 = xPrev1;
                xPrev1 = xNew;
            } catch (error) {
                errorMessage = `Error in iteration ${i+1}: ${error.message}`;
                return { iterations, root, errorMessage };
            }
        }
        
        return { iterations, root, errorMessage };
    }
}

// Display results
function displayResults(method, results) {
    let html = '';
    
    if (results.errorMessage) {
        html = `<div class="error-message">${results.errorMessage}</div>`;
    } else if (results.iterations.length === 0) {
        html = `<div class="error-message">No iterations performed. Check your parameters.</div>`;
    } else {
        if (results.root !== null) {
            html += `<div class="success-message">Root found: ${results.root.toFixed(8)}</div>`;
        } else {
            html += `<div class="error-message">Method did not converge within ${maxIterationsInput.value} iterations.</div>`;
        }
        
        // Create table
        html += `<div class="result-card"><h4>${method} Iterations</h4><table>`;
        
        // Table headers
        if (method === 'Bisection Method') {
            html += `<tr><th>Iteration</th><th>a</th><th>b</th><th>Root</th><th>f(Root)</th><th>Approx Error %</th></tr>`;
            results.iterations.forEach(iter => {
                html += `<tr>
                    <td>${iter.iteration}</td>
                    <td>${iter.a.toFixed(6)}</td>
                    <td>${iter.b.toFixed(6)}</td>
                    <td>${iter.root.toFixed(8)}</td>
                    <td>${iter.f_root.toExponential(4)}</td>
                    <td>${iter.error !== null ? iter.error.toFixed(6) : '-'}</td>
                </tr>`;
            });
        } else if (method === 'False Position Method') {
            html += `<tr><th>Iteration</th><th>a</th><th>b</th><th>Root</th><th>f(Root)</th><th>Approx Error %</th></tr>`;
            results.iterations.forEach(iter => {
                html += `<tr>
                    <td>${iter.iteration}</td>
                    <td>${iter.a.toFixed(6)}</td>
                    <td>${iter.b.toFixed(6)}</td>
                    <td>${iter.root.toFixed(8)}</td>
                    <td>${iter.f_root.toExponential(4)}</td>
                    <td>${iter.error !== null ? iter.error.toFixed(6) : '-'}</td>
                </tr>`;
            });
        } else if (method === 'Fixed Point Iteration') {
            html += `<tr><th>Iteration</th><th>x_i</th><th>x_i+1</th><th>g(x_i)</th><th>Approx Error %</th></tr>`;
            results.iterations.forEach(iter => {
                html += `<tr>
                    <td>${iter.iteration}</td>
                    <td>${iter.x_i.toFixed(8)}</td>
                    <td>${iter.x_i1.toFixed(8)}</td>
                    <td>${iter.g_x.toFixed(8)}</td>
                    <td>${iter.error !== null ? iter.error.toFixed(6) : '-'}</td>
                </tr>`;
            });
        } else if (method === 'Newton-Raphson Method') {
            html += `<tr><th>Iteration</th><th>x_i</th><th>x_i+1</th><th>f(x_i)</th><th>f'(x_i)</th><th>Approx Error %</th></tr>`;
            results.iterations.forEach(iter => {
                html += `<tr>
                    <td>${iter.iteration}</td>
                    <td>${iter.x_i.toFixed(8)}</td>
                    <td>${iter.x_i1.toFixed(8)}</td>
                    <td>${iter.f_x.toExponential(4)}</td>
                    <td>${iter.f_prime_x.toExponential(4)}</td>
                    <td>${iter.error !== null ? iter.error.toFixed(6) : '-'}</td>
                </tr>`;
            });
        } else if (method === 'Secant Method') {
            html += `<tr><th>Iteration</th><th>x_i-1</th><th>x_i</th><th>f(x_i-1)</th><th>f(x_i)</th><th>Approx Error %</th></tr>`;
            results.iterations.forEach(iter => {
                html += `<tr>
                    <td>${iter.iteration}</td>
                    <td>${iter.x_i1.toFixed(8)}</td>
                    <td>${iter.x_i.toFixed(8)}</td>
                    <td>${iter.f_x_i1.toExponential(4)}</td>
                    <td>${iter.f_x_i.toExponential(4)}</td>
                    <td>${iter.error !== '-' ? iter.error.toFixed(6) : iter.error}</td>
                </tr>`;
            });
        }
        
        html += `</table></div>`;
    }
    
    return html;
}

// Plot function
function plotFunction(equation, roots = []) {
    // Generate x values
    const xValues = [];
    const yValues = [];
    
    // Determine a good range for x based on roots
    let xMin = -5, xMax = 5;
    if (roots.length > 0) {
        xMin = Math.min(...roots) - 2;
        xMax = Math.max(...roots) + 2;
    }
    
    const step = (xMax - xMin) / 100;
    
    // Compile the function
    let f;
    try {
        f = math.compile(equation);
    } catch (error) {
        plotContainer.innerHTML = `<div class="error-message">Error compiling equation for plotting: ${error.message}</div>`;
        return;
    }
    
    // Evaluate function
    for (let x = xMin; x <= xMax; x += step) {
        try {
            xValues.push(x);
            yValues.push(f.evaluate({x: x}));
        } catch (error) {
            // Skip points where function is undefined
            xValues.push(x);
            yValues.push(null);
        }
    }
    
    // Create trace for function
    const trace = {
        x: xValues,
        y: yValues,
        type: 'scatter',
        mode: 'lines',
        name: 'f(x)',
        line: { color: '#3498db', width: 2 }
    };
    
    // Create trace for roots
    const rootTraces = roots.map((root, index) => {
        return {
            x: [root],
            y: [0],
            type: 'scatter',
            mode: 'markers',
            name: `Root ${index+1}`,
            marker: { 
                color: '#e74c3c', 
                size: 10,
                symbol: 'circle'
            }
        };
    });
    
    // Create zero line
    const zeroLine = {
        x: [xMin, xMax],
        y: [0, 0],
        type: 'scatter',
        mode: 'lines',
        name: 'y=0',
        line: { color: '#95a5a6', width: 1, dash: 'dash' }
    };
    
    // Combine all traces
    const data = [trace, zeroLine, ...rootTraces];
    
    // Layout
    const layout = {
        title: 'Function Plot',
        xaxis: { title: 'x' },
        yaxis: { title: 'f(x)' },
        hovermode: 'closest',
        showlegend: true,
        legend: { x: 0, y: 1 },
        margin: { l: 50, r: 50, t: 50, b: 50 }
    };
    
    // Plot
    Plotly.newPlot(plotContainer, data, layout, { responsive: true });
}

// Compare methods
function compareMethods(results) {
    let html = '<div class="comparison-table"><h3>Method Comparison</h3><table>';
    html += '<tr><th>Method</th><th>Root</th><th>Iterations</th><th>Final Error %</th><th>Status</th></tr>';

    Object.keys(results).forEach(method => {
        const result = results[method];
        const iterations = result.iterations;

        let root = '-';
        let numIterations = 0;
        let error = '-';
        let status = '';

        if (result.errorMessage) {
            status = `<span class="status-error">Error</span>`;
            // You could log the full error: console.log(`${method} Error:`, result.errorMessage);
        } else if (iterations.length > 0) {
            numIterations = iterations.length;
            const lastIteration = iterations[iterations.length - 1];
            
            // Check for '-', as secant method has it on first iter
            error = (lastIteration.error !== null && lastIteration.error !== '-' && typeof lastIteration.error === 'number') 
                ? lastIteration.error.toFixed(6) 
                : '-';

            if (result.root !== null) {
                root = result.root.toFixed(8);
                status = '<span class="status-success">Converged</span>';
            } else {
                status = '<span class="status-warning">No Convergence</span>';
            }
        } else {
            status = '<span class="status-warning">No Iterations</span>';
        }

        html += `
            <tr>
                <td>${method}</td>
                <td>${root}</td>
                <td>${numIterations}</td>
                <td>${error}</td>
                <td>${status}</td>
            </tr>
        `;
    });

    html += '</table></div>';
    comparisonOutput.innerHTML = html;
}

// --- Event Listeners and Initialization ---

// Initialize parameters UI on method change
methodSelect.addEventListener('change', initMethodParams);

// Initialize parameters UI on page load
window.addEventListener('DOMContentLoaded', initMethodParams);

// Handle calculation on button click
calculateBtn.addEventListener('click', handleCalculate);

// Main function to handle calculation
function handleCalculate() {
    // 1. Show loading spinners and clear old results
    resultsOutput.innerHTML = '';
    comparisonOutput.innerHTML = '';
    plotContainer.innerHTML = '';
    loadingResults.style.display = 'block';
    loadingComparison.style.display = 'block';
    
    // 2. Get common inputs
    const equation = equationInput.value;
    const tolerance = parseFloat(toleranceInput.value);
    const maxIterations = parseInt(maxIterationsInput.value);
    const method = methodSelect.value;
    
    // 3. Create RootFinder instance
    let finder;
    try {
        finder = new RootFinder(equation, tolerance, maxIterations);
    } catch (error) {
        resultsOutput.innerHTML = `<div class="error-message">${error.message}</div>`;
        loadingResults.style.display = 'none';
        loadingComparison.style.display = 'none';
        return;
    }

    let results = {};
    let singleMethodHtml = '';
    
    // Helper to safely run methods
    const runMethod = (methodName, params) => {
        try {
            // Use .apply to pass params as an array
            return finder[methodName].apply(finder, params);
        } catch (error) {
            return { iterations: [], root: null, errorMessage: `Calculation error: ${error.message}` };
        }
    };
    
    // 4. Logic for "all" vs "single" method
    if (method === 'all') {
        try {
            // Get all params
            const bisectionA = parseFloat(document.getElementById('bisectionA').value);
            const bisectionB = parseFloat(document.getElementById('bisectionB').value);
            const falsePositionA = parseFloat(document.getElementById('falsePositionA').value);
            const falsePositionB = parseFloat(document.getElementById('falsePositionB').value);
            const fixedPointX0 = parseFloat(document.getElementById('fixedPointX0').value);
            const fixedPointG = document.getElementById('fixedPointG').value;
            const newtonX0 = parseFloat(document.getElementById('newtonX0').value);
            const secantX0 = parseFloat(document.getElementById('secantX0').value);
            const secantX1 = parseFloat(document.getElementById('secantX1').value);

            // Run all
            results['Bisection'] = runMethod('bisection', [bisectionA, bisectionB]);
            results['False Position'] = runMethod('falsePosition', [falsePositionA, falsePositionB]);
            results['Fixed Point'] = runMethod('fixedPoint', [fixedPointX0, fixedPointG]);
            results['Newton-Raphson'] = runMethod('newtonRaphson', [newtonX0]);
            results['Secant'] = runMethod('secant', [secantX0, secantX1]);
            
            // Display comparison
            compareMethods(results);
            
            // Display individual results
            singleMethodHtml += displayResults('Bisection Method', results['Bisection']);
            singleMethodHtml += displayResults('False Position Method', results['False Position']);
            singleMethodHtml += displayResults('Fixed Point Iteration', results['Fixed Point']);
            singleMethodHtml += displayResults('Newton-Raphson Method', results['Newton-Raphson']);
            singleMethodHtml += displayResults('Secant Method', results['Secant']);
            resultsOutput.innerHTML = singleMethodHtml;

        } catch (error) {
             resultsOutput.innerHTML = `<div class="error-message">Error getting parameters for 'All Methods': ${error.message}</div>`;
        }
    } else {
        // Run single method
        let result;
        let methodName = '';
        try {
            if (method === 'bisection') {
                methodName = 'Bisection Method';
                const a = parseFloat(document.getElementById('bisectionA').value);
                const b = parseFloat(document.getElementById('bisectionB').value);
                result = finder.bisection(a, b);
            } else if (method === 'falsePosition') {
                methodName = 'False Position Method';
                const a = parseFloat(document.getElementById('falsePositionA').value);
                const b = parseFloat(document.getElementById('falsePositionB').value);
                result = finder.falsePosition(a, b);
            } else if (method === 'fixedPoint') {
                methodName = 'Fixed Point Iteration';
                const x0 = parseFloat(document.getElementById('fixedPointX0').value);
                const g = document.getElementById('fixedPointG').value;
                result = finder.fixedPoint(x0, g);
            } else if (method === 'newtonRaphson') {
                methodName = 'Newton-Raphson Method';
                const x0 = parseFloat(document.getElementById('newtonX0').value);
                result = finder.newtonRaphson(x0);
            } else if (method === 'secant') {
                methodName = 'Secant Method';
                const x0 = parseFloat(document.getElementById('secantX0').value);
                const x1 = parseFloat(document.getElementById('secantX1').value);
                result = finder.secant(x0, x1);
            }
            
            resultsOutput.innerHTML = displayResults(methodName, result);
            results[methodName] = result; // Add to results for plotting
            
        } catch (error) {
            resultsOutput.innerHTML = `<div class="error-message">Error getting parameters for ${method}: ${error.message}</div>`;
        }
    }
    
    // 5. Plotting
    const roots = Object.values(results)
        .map(r => r.root)
        .filter(root => root !== null); // Get all valid, non-null roots
        
    plotFunction(equation, [...new Set(roots)]); // Use Set to avoid duplicate root markers

    // 6. Hide loading spinners
    loadingResults.style.display = 'none';
    loadingComparison.style.display = 'none';
}
