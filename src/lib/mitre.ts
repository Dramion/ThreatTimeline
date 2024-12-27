export const MITRE_TACTICS_AND_TECHNIQUES: Record<string, string[]> = {
  "Resource Development": [
    "Acquire Infrastructure",
    "Compromise Infrastructure",
    "Develop Capabilities",
    "Obtain Capabilities",
    "Stage Capabilities"
  ],
  "Initial Access": [
    "Drive-by Compromise",
    "Exploit Public-Facing Application",
    "External Remote Services",
    "Hardware Additions",
    "Phishing",
    "Valid Accounts"
  ],
  "Execution": [
    "Command and Scripting Interpreter",
    "Container Administration Command",
    "Deploy Container",
    "Native API",
    "Scheduled Task/Job",
    "System Services",
    "User Execution"
  ],
  "Persistence": [
    "Account Manipulation",
    "Boot or Logon Autostart Execution",
    "Create Account",
    "Hijack Execution Flow",
    "Scheduled Task/Job",
    "Valid Accounts"
  ],
  "Privilege Escalation": [
    "Access Token Manipulation",
    "Boot or Logon Autostart Execution",
    "Process Injection",
    "Scheduled Task/Job",
    "Valid Accounts"
  ],
  "Defense Evasion": [
    "Deobfuscate/Decode Files or Information",
    "Hide Artifacts",
    "Indicator Removal",
    "Masquerading",
    "Obfuscated Files or Information",
    "Process Injection",
    "Rootkit"
  ],
  "Credential Access": [
    "Brute Force",
    "Credentials from Password Stores",
    "Forge Web Credentials",
    "OS Credential Dumping",
    "Steal Web Session Cookie"
  ],
  "Discovery": [
    "Account Discovery",
    "File and Directory Discovery",
    "Network Service Scanning",
    "Process Discovery",
    "System Information Discovery"
  ],
  "Lateral Movement": [
    "Exploitation of Remote Services",
    "Internal Spearphishing",
    "Lateral Tool Transfer",
    "Remote Services",
    "Taint Shared Content"
  ],
  "Collection": [
    "Archive Collected Data",
    "Automated Collection",
    "Data from Information Repositories",
    "Data Staged",
    "Screen Capture"
  ],
  "Command and Control": [
    "Application Layer Protocol",
    "Data Encoding",
    "Dynamic Resolution",
    "Encrypted Channel",
    "Non-Standard Port",
    "Protocol Tunneling",
    "Proxy"
  ],
  "Exfiltration": [
    "Automated Exfiltration",
    "Data Transfer Size Limits",
    "Exfiltration Over Alternative Protocol",
    "Exfiltration Over Web Service",
    "Scheduled Transfer"
  ],
  "Impact": [
    "Account Access Removal",
    "Data Destruction",
    "Data Encrypted for Impact",
    "Defacement",
    "Denial of Service",
    "Endpoint Denial of Service",
    "Network Denial of Service",
    "Resource Hijacking",
    "Service Stop"
  ]
};

export const getTechniqueId = (technique: string): string => {
  // This is a simplified version - you might want to add a proper mapping
  return technique.toUpperCase().replace(/\s+/g, '');
};