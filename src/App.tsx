import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Copy, Shield, Activity, Box, Globe, PhoneCall, BookOpen, Terminal, Network, KeyRound, Gauge } from 'lucide-react';
import { useEffect } from "react";
import { toast } from 'sonner';

interface RuntimeEnv {
  CAPTAIN_DOMAIN?: string;
  INTERNAL_LB_ENABLED?: string;
  KUBEADM_ENABLED?: string;
  CLUSTER_CA_CERTIFICATE?: string;
}

const getEnv = (key: keyof RuntimeEnv, placeholder: string) => {
  const env = (window as unknown as { _env_?: RuntimeEnv })._env_;
  return env?.[key] || (import.meta.env[key] as string) || placeholder;
};

function App() {
  const headerStyle = { fontFamily: "'Cuprum', sans-serif", fontWeight: 700 };
  const subHeaderStyle = { fontFamily: "'Cuprum', sans-serif", fontWeight: 600 };

  const captainDomain = getEnv('CAPTAIN_DOMAIN', 'CAPTAIN_DOMAIN_PLACEHOLDER');
  const internalLbEnabled = getEnv('INTERNAL_LB_ENABLED', 'FALSE').toUpperCase() === 'TRUE';
  const kubeadmEnabled = getEnv('KUBEADM_ENABLED', 'FALSE').toUpperCase() === 'TRUE';
  const clusterCaCertificate = getEnv('CLUSTER_CA_CERTIFICATE', '');
  // Default namespace = first label of the captain domain (e.g. "nonprod" from "nonprod.jupiter.onglueops.rocks")
  const defaultNamespace = captainDomain.split('.')[0];

  const kubeconfig = `apiVersion: v1
kind: Config
clusters:
  - name: ${captainDomain}
    cluster:
      server: https://kube-api.${captainDomain}
      certificate-authority-data: "${clusterCaCertificate}"
contexts:
  - name: ${captainDomain}
    context:
      cluster: ${captainDomain}
      user: ${captainDomain}
      namespace: ${defaultNamespace}
current-context: ${captainDomain}
users:
  - name: ${captainDomain}
    user:
      exec:
        apiVersion: client.authentication.k8s.io/v1
        env:
          - name: NODE_OPTIONS
            value: --no-deprecation
        command: kubectl
        args:
          - oidc-login
          - get-token
          - --grant-type=device-code
          - --oidc-issuer-url=https://dex.${captainDomain}
          - --oidc-client-id=kubectl
          - --oidc-extra-scope=profile
          - --oidc-extra-scope=email
          - --oidc-extra-scope=groups
        interactiveMode: IfAvailable
`;

  const domains = [
    { label: "Captain Domain", value: captainDomain, icon: <Globe className="w-4 h-4" /> },
    { label: "Apps Domain", value: `*.apps.${captainDomain}`, icon: <Box className="w-4 h-4" /> },
    { label: "Public Load Balancer", value: `public-v2.${captainDomain}`, icon: <Shield className="w-4 h-4" /> },
    ...(internalLbEnabled ? [{ label: "Internal Load Balancer", value: `internal-v2.${captainDomain}`, icon: <Shield className="w-4 h-4" /> }] : []),
  ];

  const tools = [
    {
        name: "Deployments",
        desc: "Manage and visualize application lifecycles.",
        icon: <Box className="text-[#084218]" />,
        tag: "ArgoCD",
        links: [{ label: "Open Dashboard", url: `https://argocd.${captainDomain}` }],
    },
    {
        name: "Observability",
        desc: "Logs, metrics, and system performance.",
        icon: <Activity className="text-[#084218]" />,
        tag: "Grafana",
        links: [{ label: "Open Dashboard", url: `https://grafana.${captainDomain}` }],
    },
    {
        name: "Secrets",
        desc: "Secure management of sensitive data.",
        icon: <KeyRound className="text-[#084218]" />,
        tag: "Vault",
        links: [{ label: "Open Dashboard", url: `https://vault.${captainDomain}` }],
    },
    {
        name: "LB Dashboards",
        desc: "Real-time traffic routing stats.",
        icon: <Network className="text-[#084218]" />,
        tag: "Traefik",
        links: [
            { label: "Public", url: `https://dashboard-traefik-public-v2.${captainDomain}` },
            ...(internalLbEnabled ? [{ label: "Internal", url: `https://dashboard-traefik-internal-v2.${captainDomain}` }] : []),
        ],
    },
    ...(kubeadmEnabled ? [{
        name: "Goldilocks",
        desc: "Right-size resource requests and limits.",
        icon: <Gauge className="text-[#084218]" />,
        tag: "Goldilocks",
        links: [{ label: "Open Dashboard", url: `https://goldilocks.${captainDomain}` }],
    }] : []),
  ];

  const handleCopy = async (text: string, label: string) => {
    try {
      if (!navigator.clipboard) {
        throw new Error("Clipboard API not available")
      }
      await navigator.clipboard.writeText(text)
      toast.success(`${label} copied to clipboard`)
    } catch (err) {
      console.error("Failed to copy!", err);
      toast.error(`Failed to copy ${label}`);
    }
  }

  useEffect(() => {
    document.title = `GlueOps - ${captainDomain}`;
  }, [captainDomain]);

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-[#084218] border-b border-[#F4C624]/20 py-4 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg">
                <img src="/logo.png" alt="GlueOps" className="w-12 h-12" />
            </div>
            {/* Subheader application */}
            <span style={subHeaderStyle} className="tracking-tight text-xl text-white">GlueOps Platform</span>
          </div>
          {/* Header application */}
          <h1 style={headerStyle} className="text-4xl md:text-6xl text-white mb-2">Cluster Dashboard</h1>
          <p className="text-[#F4C624] font-mono text-sm tracking-widest uppercase">
             {captainDomain}
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sidebar */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <Card className="bg-slate-800 border-[#F4C624]/30 shadow-xl">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-[#084218] rounded-full text-[#F4C624]">
                    <PhoneCall size={20} />
                  </div>
                  <div>
                    <p style={subHeaderStyle} className="text-sm text-[#F4C624] uppercase tracking-wider">24/7 Emergency Support</p>
                    <p style={headerStyle} className="text-2xl text-white">+1-877-GLUE-OPS</p>
                  </div>
                </div>
                <a href="https://docs.glueops.dev" style={subHeaderStyle} className="flex items-center justify-between p-4 rounded-lg bg-[#084218] text-white hover:bg-[#084218]/80 transition-colors">
                  <span className="flex items-center gap-2"><BookOpen size={18} /> Documentation</span>
                  <ExternalLink size={14} />
                </a>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700 shadow-xl grow">
              <CardHeader>
                <CardTitle style={subHeaderStyle} className="text-sm uppercase tracking-widest text-[#F4C624]">Network Endpoints</CardTitle>
              </CardHeader>
              <CardContent data-testid="network-endpoints" className="grow flex flex-col justify-start gap-4">
                {domains.map((dom, i) => (
                  <div key={i} className="group p-3 rounded-md border border-slate-700 bg-slate-900/50 hover:border-[#F4C624]/50 transition-all">
                    <p style={subHeaderStyle} className="text-xs text-slate-500 uppercase flex items-center gap-2 mb-1">
                      {dom.icon} {dom.label}
                    </p>
                    <div className="flex items-center justify-between">
                      <code className="text-sm text-slate-300 break-all font-mono">{dom.value}</code>
                      <button
                        type="button"
                        onClick={() => handleCopy(dom.value, dom.label)}
                        className="text-slate-500 hover:text-[#F4C624] transition-colors ml-2"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Tool Grid */}
          <div className="lg:col-span-8">
            <div data-testid="tool-grid" className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tools.map((tool, i) => (
                <Card key={i} className="bg-slate-800 border-slate-700 group hover:border-[#F4C624] transition-all duration-300 shadow-xl">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <div className="p-2 rounded-lg bg-[#F4C624]">
                        {tool.icon}
                    </div>
                    <Badge className="bg-[#084218] text-[#F4C624] border-none hover:bg-[#084218] font-mono text-[10px]">
                      {tool.tag}
                    </Badge>
                  </CardHeader>
                  <CardContent className="grow flex flex-col">
                    <CardTitle style={headerStyle} className="text-2xl text-white mb-2">{tool.name}</CardTitle>
                    <CardDescription className="text-slate-400 mb-6 h-12">
                      {tool.desc}
                    </CardDescription>
                    <div className="flex gap-3 mt-auto">
                      {tool.links.map((link, j) => (
                        <a
                          key={j}
                          href={link.url}
                          target="_blank"
                          style={subHeaderStyle}
                          className="flex flex-1 items-center justify-center gap-2 py-2.5 rounded-lg bg-transparent border border-[#F4C624] text-[#F4C624] hover:bg-[#F4C624] hover:text-[#084218] transition-all"
                        >
                          {link.label} <ExternalLink size={14} />
                        </a>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

        </div>

        {/* Kubeconfig (only rendered when kubeadm is enabled) */}
        {kubeadmEnabled && (
          <div data-testid="kubeconfig" className="mt-8">
            <Card className="bg-slate-800 border-slate-700 shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle style={subHeaderStyle} className="text-sm uppercase tracking-widest text-[#F4C624] flex items-center gap-2">
                    <Terminal size={16} /> Kubeconfig
                  </CardTitle>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(kubeconfig, 'Kubeconfig')}
                  style={subHeaderStyle}
                  className="flex items-center gap-2 py-2 px-4 rounded-lg bg-transparent border border-[#F4C624] text-[#F4C624] hover:bg-[#F4C624] hover:text-[#084218] transition-all shrink-0 ml-4"
                >
                  <Copy size={14} /> Copy
                </button>
              </CardHeader>
              <CardContent>
                <pre className="overflow-x-auto rounded-md border border-slate-700 bg-slate-900/50 p-4 text-sm text-slate-300 font-mono">
                  <code>{kubeconfig}</code>
                </pre>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}

export default App;