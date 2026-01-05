// OS-01 Scout - Frontend Application
// All data is generated and processed locally

// Initialize Telegram Web App
if (typeof Telegram !== 'undefined') {
    Telegram.WebApp.ready();
    Telegram.WebApp.expand();
    Telegram.WebApp.setHeaderColor('#0f0f0f');
    Telegram.WebApp.setBackgroundColor('#0f0f0f');
}

// Data storage (in-memory, cleared on refresh)
const simulationData = {
    osint: {},
    vulnerabilities: [],
    passwordChecks: [],
    networkData: [],
    reports: []
};

// Tab switching
function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });

    // Show selected tab
    document.getElementById(`${tabName}-tab`).classList.add('active');
    document.querySelector(`.tab[onclick="switchTab('${tabName}')"]`).classList.add('active');
}

// OSINT Functions
async function gatherOSINT() {
    const username = document.getElementById('targetUsername').value.trim();
    const email = document.getElementById('targetEmail').value.trim();
    
    if (!username) {
        alert('Please enter a username');
        return;
    }

    // Show loader
    const loader = document.getElementById('osint-loader');
    const resultsDiv = document.getElementById('osint-results');
    loader.classList.add('active');
    resultsDiv.classList.remove('active');

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Generate simulated OSINT data
    const simulatedData = generateSimulatedOSINT(username, email);
    
    // Store in memory
    simulationData.osint = simulatedData;
    
    // Display results
    displayOSINTResults(simulatedData);
    
    // Hide loader, show results
    loader.classList.remove('active');
    resultsDiv.classList.add('active');
}

function generateSimulatedOSINT(username, email) {
    const domains = ['twitter.com', 'github.com', 'instagram.com', 'linkedin.com', 'facebook.com'];
    const possibleEmails = [
        `${username}@gmail.com`,
        `${username}@yahoo.com`,
        email || `${username}.work@protonmail.com`
    ];
    
    const simulatedProfiles = domains.map(domain => ({
        platform: domain,
        url: `https://${domain}/${username}`,
        found: Math.random() > 0.3,
        lastActive: `2024-0${Math.floor(Math.random() * 9) + 1}-${Math.floor(Math.random() * 28) + 1}`
    }));

    const simulatedBreaches = [
        { name: "Collection #1", date: "2023-03-15", entries: "2.7B" },
        { name: "AntiPublic", date: "2022-11-30", entries: "1.2B" },
        { name: "Facebook Data 2021", date: "2021-04-03", entries: "533M" }
    ].filter(() => Math.random() > 0.5);

    const phoneNumbers = [
        `+1${Math.floor(Math.random() * 900000000) + 100000000}`,
        `+44${Math.floor(Math.random() * 9000000000) + 1000000000}`
    ];

    return {
        username,
        email: email || possibleEmails[0],
        profiles: simulatedProfiles.filter(p => p.found),
        breaches: simulatedBreaches,
        phoneNumbers: phoneNumbers.slice(0, Math.floor(Math.random() * 2) + 1),
        location: {
            city: ["New York", "London", "Tokyo", "Moscow", "Berlin"][Math.floor(Math.random() * 5)],
            country: ["US", "UK", "JP", "RU", "DE"][Math.floor(Math.random() * 5)],
            ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
        },
        timestamp: new Date().toISOString()
    };
}

function displayOSINTResults(data) {
    const resultsDiv = document.getElementById('osint-results');
    
    let html = `
        <h3 style="color: var(--accent); margin-bottom: 15px;">📊 OSINT Report: ${data.username}</h3>
        
        <div class="info-box">
            <strong>Target Information:</strong><br>
            • Username: ${data.username}<br>
            • Email: ${data.email}<br>
            • Location: ${data.location.city}, ${data.location.country}<br>
            • IP Address: ${data.location.ip} (Simulated)
        </div>
    `;

    // Profiles
    if (data.profiles.length > 0) {
        html += `<h4>🔗 Social Media Profiles (Simulated):</h4>`;
        html += `<table class="data-table">`;
        html += `<tr><th>Platform</th><th>URL</th><th>Last Active</th></tr>`;
        data.profiles.forEach(profile => {
            html += `<tr>
                <td>${profile.platform}</td>
                <td><a href="#" style="color: var(--accent);">${profile.url}</a></td>
                <td>${profile.lastActive}</td>
            </tr>`;
        });
        html += `</table>`;
    }

    // Breaches
    if (data.breaches.length > 0) {
        html += `<div class="danger-box" style="margin-top: 15px;">
            <h4>⚠️ Found in ${data.breaches.length} Simulated Data Breaches:</h4>`;
        data.breaches.forEach(breach => {
            html += `<div>• ${breach.name} (${breach.date}) - ${breach.entries} records</div>`;
        });
        html += `</div>`;
    }

    // Phone numbers
    if (data.phoneNumbers.length > 0) {
        html += `<h4 style="margin-top: 15px;">📱 Associated Phone Numbers (Simulated):</h4>`;
        data.phoneNumbers.forEach(phone => {
            html += `<div>• ${phone}</div>`;
        });
    }

    html += `
        <div class="warning-box" style="margin-top: 15px;">
            <strong>Simulation Note:</strong> This data is generated locally for educational purposes in OS-01 environment.
            No real person is being targeted or investigated.
        </div>
    `;

    resultsDiv.innerHTML = html;
}

function clearOSINT() {
    document.getElementById('osint-results').innerHTML = '';
    document.getElementById('osint-results').classList.remove('active');
    document.getElementById('targetUsername').value = '';
    document.getElementById('targetEmail').value = '';
    simulationData.osint = {};
}

// Vulnerability Scanning
async function scanTarget() {
    const target = document.getElementById('targetDomain').value.trim();
    const scanType = document.getElementById('scanType').value;
    
    if (!target) {
        alert('Please enter a target domain or IP');
        return;
    }

    const loader = document.getElementById('scan-loader');
    const resultsPre = document.getElementById('scan-results');
    loader.classList.add('active');

    // Simulate scanning delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate simulated scan results
    const scanResults = generateSimulatedScan(target, scanType);
    simulationData.vulnerabilities.push({
        target,
        scanType,
        results: scanResults,
        timestamp: new Date().toISOString()
    });

    // Display results
    resultsPre.textContent = scanResults;
    loader.classList.remove('active');
}

function generateSimulatedScan(target, scanType) {
    const ports = {
        quick: [21, 22, 25, 53, 80, 110, 143, 443, 465, 587, 993, 995, 3306, 3389],
        full: Array.from({length: 100}, (_, i) => i + 1),
        web: [80, 443, 8080, 8443]
    };

    const openPorts = ports[scanType]
        .filter(() => Math.random() > 0.7)
        .slice(0, scanType === 'full' ? 15 : 5);

    const vulnerabilities = [
        { cve: "CVE-2024-12345", severity: "CRITICAL", description: "Remote Code Execution", port: 443 },
        { cve: "CVE-2023-45678", severity: "HIGH", description: "SQL Injection", port: 80 },
        { cve: "CVE-2023-98765", severity: "MEDIUM", description: "Cross-Site Scripting", port: 8080 }
    ].filter(() => Math.random() > 0.5);

    let output = `=== Simulated Vulnerability Scan Report ===\n`;
    output += `Target: ${target}\n`;
    output += `Scan Type: ${scanType.toUpperCase()}\n`;
    output += `Time: ${new Date().toLocaleString()}\n`;
    output += `Simulation ID: OS-01-${Date.now().toString(36)}\n\n`;

    output += `[+] Port Scan Results:\n`;
    output += `----------------------------------------\n`;
    openPorts.forEach(port => {
        const services = {
            21: "FTP", 22: "SSH", 25: "SMTP", 53: "DNS", 
            80: "HTTP", 443: "HTTPS", 3306: "MySQL", 3389: "RDP"
        };
        output += `Port ${port}/tcp OPEN - ${services[port] || 'Unknown Service'}\n`;
    });

    if (vulnerabilities.length > 0) {
        output += `\n[+] Vulnerability Assessment:\n`;
        output += `----------------------------------------\n`;
        vulnerabilities.forEach(vuln => {
            output += `[${vuln.severity}] ${vuln.cve} - ${vuln.description}\n`;
            output += `  Port: ${vuln.port}/tcp\n`;
            output += `  Risk Score: ${Math.floor(Math.random() * 90) + 10}/100\n\n`;
        });
    }

    output += `\n[+] Security Recommendations:\n`;
    output += `----------------------------------------\n`;
    output += `1. Close unnecessary ports (${openPorts.slice(0, 3).join(', ')})\n`;
    output += `2. Update software to latest versions\n`;
    output += `3. Implement WAF and rate limiting\n\n`;

    output += `=== End of Simulation Report ===\n`;
    output += `Note: This is a training simulation in OS-01 environment.\n`;
    output += `No actual systems were scanned or compromised.`;

    return output;
}

// Password Functions
function checkPassword() {
    const password = document.getElementById('passwordInput').value;
    const resultsDiv = document.getElementById('password-results');
    
    if (!password) {
        alert('Please enter a password');
        return;
    }

    // Simulate password analysis
    const strength = calculatePasswordStrength(password);
    const breaches = simulateBreachCheck(password);
    
    simulationData.passwordChecks.push({
        password: '*'.repeat(password.length),
        strength,
        breaches,
        timestamp: new Date().toISOString()
    });

    let html = `<h3>🔐 Password Analysis</h3>`;
    html += `<div class="${strength.score > 70 ? 'info-box' : strength.score > 40 ? 'warning-box' : 'danger-box'}">`;
    html += `<strong>Strength: ${strength.level}</strong> (${strength.score}/100)<br>`;
    html += `Length: ${password.length} characters<br>`;
    html += `Contains uppercase: ${/[A-Z]/.test(password) ? '✅' : '❌'}<br>`;
    html += `Contains lowercase: ${/[a-z]/.test(password) ? '✅' : '❌'}<br>`;
    html += `Contains numbers: ${/\d/.test(password) ? '✅' : '❌'}<br>`;
    html += `Contains symbols: ${/[^A-Za-z0-9]/.test(password) ? '✅' : '❌'}<br>`;
    html += `</div>`;

    if (breaches.found) {
        html += `<div class="danger-box">`;
        html += `<strong>⚠️ Password found in simulated breaches!</strong><br>`;
        html += `Breach count: ${breaches.count}<br>`;
        html += `First seen: ${breaches.firstSeen}<br>`;
        html += `</div>`;
    } else {
        html += `<div class="info-box">`;
        html += `<strong>✅ Not found in simulated breach databases</strong><br>`;
        html += `This is a good sign in this simulation.`;
        html += `</div>`;
    }

    html += `<div class="warning-box" style="margin-top: 15px;">`;
    html += `<strong>Simulation Note:</strong> This check is performed locally. No password data is sent over the network.<br>`;
    html += `For real security, use password managers and enable 2FA.`;
    html += `</div>`;

    resultsDiv.innerHTML = html;
    resultsDiv.classList.add('active');
}

function calculatePasswordStrength(password) {
    let score = 0;
    
    // Length
    score += Math.min(password.length * 4, 40);
    
    // Complexity
    if (/[A-Z]/.test(password)) score += 10;
    if (/[a-z]/.test(password)) score += 10;
    if (/\d/.test(password)) score += 10;
    if (/[^A-Za-z0-9]/.test(password)) score += 15;
    
    // Deductions for common patterns
    if (/password|123456|qwerty/i.test(password)) score -= 30;
    if (password.length < 8) score -= 20;
    
    score = Math.max(0, Math.min(100, score));
    
    let level = "Very Weak";
    if (score > 80) level = "Very Strong";
    else if (score > 60) level = "Strong";
    else if (score > 40) level = "Moderate";
    else if (score > 20) level = "Weak";
    
    return { score, level };
}

function simulateBreachCheck(password) {
    // Simulated common breached passwords
    const breachedPasswords = [
        "password", "123456", "12345678", "qwerty", "abc123",
        "password1", "12345", "123456789", "letmein", "welcome"
    ];
    
    const found = breachedPasswords.includes(password.toLowerCase());
    
    return {
        found,
        count: found ? Math.floor(Math.random() * 5) + 1 : 0,
        firstSeen: found ? "2021-06-15" : null
    };
}

function checkHash() {
    const hash = document.getElementById('passwordHash').value.trim().toLowerCase();
    const resultsDiv = document.getElementById('password-results');
    
    if (!hash || !/^[a-f0-9]{32}$/.test(hash)) {
        alert('Please enter a valid 32-character MD5 hash');
        return;
    }

    // Simulated rainbow table
    const simulatedRainbow = {
        "5f4dcc3b5aa765d61d8327deb882cf99": "password",
        "e10adc3949ba59abbe56e057f20f883e": "123456",
        "25d55ad283aa400af464c76d713c07ad": "12345678",
        "d8578edf8458ce06fbc5bb76a58c5ca4": "qwerty",
        "7c6a180b36896a0a8c02787eeafb0e4c": "password1"
    };

    const plaintext = simulatedRainbow[hash];
    
    let html = `<h3>🔓 Hash Analysis (Simulated)</h3>`;
    html += `<div class="info-box">`;
    html += `<strong>Input Hash:</strong> ${hash}<br>`;
    html += `<strong>Hash Type:</strong> MD5 (simulated)<br>`;
    html += `<strong>Result:</strong> `;
    
    if (plaintext) {
        html += `<span style="color: var(--danger); font-weight: bold;">CRACKED</span><br>`;
        html += `<strong>Plaintext:</strong> <code style="background: #333; padding: 2px 5px; border-radius: 3px;">${plaintext}</code>`;
    } else {
        html += `<span style="color: var(--accent); font-weight: bold;">NOT FOUND</span><br>`;
        html += `Hash not found in simulated rainbow table.`;
    }
    
    html += `</div>`;
    
    html += `<div class="warning-box" style="margin-top: 15px;">`;
    html += `<strong>Educational Purpose:</strong> This demonstrates how weak hashes can be cracked.<br>`;
    html += `In real systems, use strong hashing algorithms (bcrypt, Argon2) with salts.`;
    html += `</div>`;

    resultsDiv.innerHTML = html;
    resultsDiv.classList.add('active');
}

// Network Analysis
async function analyzeNetwork() {
    const data = document.getElementById('pcapData').value.trim();
    const analysisType = document.getElementById('analysisType').value;
    const loader = document.getElementById('network-loader');
    const resultsPre = document.getElementById('network-results');
    
    if (!data) {
        alert('Please enter network data or target range');
        return;
    }

    loader.classList.add('active');
    await new Promise(resolve => setTimeout(resolve, 1800));

    const analysisResults = generateNetworkAnalysis(data, analysisType);
    simulationData.networkData.push({
        data: data.substring(0, 100) + '...',
        type: analysisType,
        results: analysisResults,
        timestamp: new Date().toISOString()
    });

    resultsPre.textContent = analysisResults;
    loader.classList.remove('active');
}

function generateNetworkAnalysis(data, type) {
    let output = `=== Network Analysis Simulation ===\n`;
    output += `Analysis Type: ${type.toUpperCase()}\n`;
    output += `Timestamp: ${new Date().toLocaleString()}\n`;
    output += `Input Size: ${data.length} characters\n\n`;

    if (type === 'traffic') {
        output += `[+] Traffic Pattern Analysis:\n`;
        output += `----------------------------------------\n`;
        output += `• Detected HTTP traffic: ${Math.floor(Math.random() * 1000)} packets\n`;
        output += `• Detected DNS queries: ${Math.floor(Math.random() * 500)} packets\n`;
        output += `• Suspected malware C2: ${Math.random() > 0.7 ? 'YES (simulated)' : 'NO'}\n`;
        output += `• Data exfiltration: ${Math.random() > 0.8 ? 'DETECTED (simulated)' : 'Not detected'}\n`;
    } else if (type === 'ports') {
        output += `[+] Open Port Detection:\n`;
        output += `----------------------------------------\n`;
        const ports = [21, 22, 23, 25, 53, 80, 110, 143, 443, 445, 993, 995, 1723, 3306, 3389, 8080];
        ports.forEach(port => {
            if (Math.random() > 0.6) {
                output += `Port ${port}/tcp: OPEN (Simulated)\n`;
            }
        });
    } else if (type === 'packets') {
        output += `[+] Packet Capture Simulation:\n`;
        output += `----------------------------------------\n`;
        for (let i = 0; i < 10; i++) {
            const src = `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
            const dst = `10.0.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
            const protocol = ['TCP', 'UDP', 'ICMP'][Math.floor(Math.random() * 3)];
            const size = Math.floor(Math.random() * 1500) + 64;
            output += `${src} -> ${dst} [${protocol}] Size: ${size} bytes\n`;
        }
    }

    output += `\n[+] Security Assessment:\n`;
    output += `----------------------------------------\n`;
    output += `Risk Level: ${['LOW', 'MEDIUM', 'HIGH'][Math.floor(Math.random() * 3)]}\n`;
    output += `Recommendations:\n`;
    output += `1. Monitor unusual outbound connections\n`;
    output += `2. Implement network segmentation\n`;
    output += `3. Use encrypted protocols (HTTPS, SSH, VPN)\n\n`;

    output += `=== End of Simulation ===\n`;
    output += `This analysis is performed locally in OS-01 simulation.\n`;
    output += `No actual network traffic was captured or analyzed.`;

    return output;
}

// Report Generation
function generateReport() {
    const resultsDiv = document.getElementById('report-results');
    
    let html = `<h3>📊 OS-01 Scout Intelligence Report</h3>`;
    html += `<div class="info-box">`;
    html += `<strong>Report Generated:</strong> ${new Date().toLocaleString()}<br>`;
    html += `<strong>Session ID:</strong> OS-01-${Date.now().toString(36).toUpperCase()}<br>`;
    html += `<strong>Data Points Collected:</strong> ${Object.values(simulationData).reduce((a, b) => a + (Array.isArray(b) ? b.length : Object.keys(b).length), 0)}`;
    html += `</div>`;

    // OSINT Summary
    if (Object.keys(simulationData.osint).length > 0) {
        html += `<h4 style="margin-top: 20px;">🔍 OSINT Summary</h4>`;
        html += `<table class="data-table">`;
        html += `<tr><th>Target</th><th>Profiles Found</th><th>Breaches</th><th>Location</th></tr>`;
        html += `<tr>
            <td>${simulationData.osint.username || 'N/A'}</td>
            <td>${simulationData.osint.profiles?.length || 0}</td>
            <td>${simulationData.osint.breaches?.length || 0}</td>
            <td>${simulationData.osint.location?.city || 'N/A'}</td>
        </tr>`;
        html += `</table>`;
    }

    // Vulnerabilities Summary
    if (simulationData.vulnerabilities.length > 0) {
        html += `<h4 style="margin-top: 20px;">🌐 Vulnerability Scan Summary</h4>`;
        html += `<table class="data-table">`;
        html += `<tr><th>Target</th><th>Scan Type</th><th>Open Ports</th><th>Vulnerabilities</th></tr>`;
        simulationData.vulnerabilities.forEach(scan => {
            const openPorts = (scan.results.match(/Port (\d+)\/tcp OPEN/g) || []).length;
            const vulns = (scan.results.match(/\[(CRITICAL|HIGH|MEDIUM)\]/g) || []).length;
            html += `<tr>
                <td>${scan.target.substring(0, 20)}${scan.target.length > 20 ? '...' : ''}</td>
                <td>${scan.scanType}</td>
                <td>${openPorts}</td>
                <td>${vulns}</td>
            </tr>`;
        });
        html += `</table>`;
    }

    // Password Checks
    if (simulationData.passwordChecks.length > 0) {
        html += `<h4 style="margin-top: 20px;">🔑 Password Security</h4>`;
        html += `<table class="data-table">`;
        html += `<tr><th>Check Time</th><th>Strength</th><th>Breach Status</th></tr>`;
        simulationData.passwordChecks.forEach(check => {
            html += `<tr>
                <td>${new Date(check.timestamp).toLocaleTimeString()}</td>
                <td><span class="badge ${check.strength.score > 70 ? 'success' : check.strength.score > 40 ? 'warning' : 'danger'}">${check.strength.level}</span></td>
                <td>${check.breaches.found ? '❌ Compromised' : '✅ Secure'}</td>
            </tr>`;
        });
        html += `</table>`;
    }

    // Recommendations
    html += `<div class="warning-box" style="margin-top: 20px;">`;
    html += `<h4>🛡️ Security Recommendations</h4>`;
    html += `1. Use strong, unique passwords for each account<br>`;
    html += `2. Enable two-factor authentication where available<br>`;
    html += `3. Keep software and systems updated<br>`;
    html += `4. Monitor for unusual account activity<br>`;
    html += `5. Use VPN on public networks<br>`;
    html += `</div>`;

    html += `<div class="info-box" style="margin-top: 20px;">`;
    html += `<strong>⚠️ Important Notice:</strong><br>`;
    html += `This report contains simulated data generated locally for educational purposes in the OS-01 environment.<br>`;
    html += `No real systems were scanned, no real data was collected, and no actual persons were investigated.<br>`;
    html += `This tool demonstrates security concepts in a controlled simulation.`;
    html += `</div>`;

    // Store report
    simulationData.reports.push({
        content: html,
        timestamp: new Date().toISOString()
    });

    resultsDiv.innerHTML = html;
    resultsDiv.classList.add('active');
}

function saveReport() {
    const reportContent = document.getElementById('report-results').innerHTML;
    if (!reportContent) {
        alert('Generate a report first');
        return;
    }

    // Create a downloadable HTML file
    const blob = new Blob([`
        <!DOCTYPE html>
        <html>
        <head>
            <title>OS-01 Scout Report ${new Date().toLocaleDateString()}</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                .header { background: #0f0f0f; color: #00ff9d; padding: 20px; margin-bottom: 20px; }
                .warning { background: #fff3cd; border-left: 4px solid #ffa502; padding: 15px; margin: 15px 0; }
                .info { background: #d1ecf1; border-left: 4px solid #0f0f0f; padding: 15px; margin: 15px 0; }
                table { width: 100%; border-collapse: collapse; margin: 15px 0; }
                th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
                th { background: #f2f2f2; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>OS-01 Scout Intelligence Report</h1>
                <p>Generated: ${new Date().toLocaleString()}</p>
            </div>
            ${reportContent}
        </body>
        </html>
    `], { type: 'text/html' });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `os-01-scout-report-${Date.now()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert('Report saved locally as HTML file');
}

function clearAllData() {
    if (confirm('Wipe all simulation data? This cannot be undone.')) {
        // Clear all data objects
        Object.keys(simulationData).forEach(key => {
            if (Array.isArray(simulationData[key])) {
                simulationData[key] = [];
            } else {
                simulationData[key] = {};
            }
        });

        // Clear all inputs and results
        document.querySelectorAll('input, textarea, select').forEach(el => {
            if (el.type !== 'button') el.value = '';
        });

        document.querySelectorAll('.result-area, pre').forEach(el => {
            if (el.id !== 'scan-results' && el.id !== 'network-results') {
                el.innerHTML = '';
                el.classList.remove('active');
            } else {
                el.textContent = '// Results cleared';
            }
        });

        alert('All simulation data has been wiped.');
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', function() {
    console.log('OS-01 Scout initialized in simulation mode');
    
    // Set version info in footer
    const footer = document.querySelector('footer');
    if (footer) {
        footer.innerHTML += `<div>Loaded: ${new Date().toLocaleString()}</div>`;
    }
});