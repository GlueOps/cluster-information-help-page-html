import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Copy, Shield, Activity, Box, Globe, PhoneCall, BookOpen } from 'lucide-react';
import { useEffect } from "react";

function App() {
  const captainDomain = import.meta.env.CAPTAIN_DOMAIN || 'CAPTAIN_DOMAIN_PLACEHOLDER';
  const internalLbEnabled = (import.meta.env.INTERNAL_LB_ENABLED || 'INTERNAL_LB_ENABLED_PLACEHOLDER').toUpperCase() === 'TRUE';
  
  const domains = [
    { label: "Captain Domain", value: captainDomain, icon: <Globe className="w-4 h-4" /> },
    { label: "Apps Domain", value: `*.apps.${captainDomain}`, icon: <Box className="w-4 h-4" /> },
    { label: "Public Load Balancer", value: `public-v2.${captainDomain}`, icon: <Shield className="w-4 h-4" /> },
    ...(internalLbEnabled ? [{ label: "Internal Load Balancer", value: `internal-v2.${captainDomain}`, icon: <Shield className="w-4 h-4" /> }] : []),
  ];

  const tools = [
    { 
        name: "Deployments", 
        url: `https://argocd.${captainDomain}`, 
        desc: "Manage and visualize application lifecycles.", 
        icon: <Box className="text-[#084218]" />,
        tag: "ArgoCD"
    },
    { 
        name: "Observability", 
        url: `https://grafana.${captainDomain}`, 
        desc: "Logs, metrics, and system performance.", 
        icon: <Activity className="text-[#084218]" />,
        tag: "Grafana"
    },
    { 
        name: "Secrets", 
        url: `https://vault.${captainDomain}`, 
        desc: "Secure management of sensitive data.", 
        icon: <Shield className="text-[#084218]" />,
        tag: "Vault"
    },
    { 
        name: "Public LB Dashboard", 
        url: `https://dashboard-traefik-public-v2.${captainDomain}`, 
        desc: "Real-time public traffic routing stats.", 
        icon: <Activity className="text-[#084218]" />,
        tag: "Traefik"
    }
  ];

  useEffect(() => {
    document.title = `GlueOps - ${captainDomain}`;
  }, [captainDomain]);

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header - Fixed to your original dark green */}
      <header className="bg-[#084218] border-b border-[#F4C624]/20 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-[#F4C624] p-2 rounded-lg">
                <img src="/logo.png" alt="GlueOps" className="w-6 h-6" />
            </div>
            <span className="font-bold tracking-tight text-xl text-white">GlueOps Platform</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2">Cluster Dashboard</h1>
          <p className="text-[#F4C624] font-mono text-sm tracking-widest uppercase">
             {captainDomain}
          </p>
        </div>
      </header>

      {/* Content Area - Now starts strictly below the header */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sidebar: Support & Domains */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="bg-slate-800 border-[#F4C624]/30 shadow-xl">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-[#084218] rounded-full text-[#F4C624]">
                    <PhoneCall size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#F4C624] uppercase tracking-wider">24/7 Emergency Support</p>
                    <p className="text-xl font-bold text-white">+1-877-GLUE-OPS</p>
                  </div>
                </div>
                <a href="https://docs.glueops.dev" className="flex items-center justify-between p-3 rounded-lg bg-[#084218] text-white font-semibold hover:bg-[#084218]/80 transition-colors">
                  <span className="flex items-center gap-2"><BookOpen size={16} /> Documentation</span>
                  <ExternalLink size={14} />
                </a>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700 shadow-xl">
              <CardHeader>
                <CardTitle className="text-xs uppercase tracking-widest text-[#F4C624]">Network Endpoints</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {domains.map((dom, i) => (
                  <div key={i} className="group p-3 rounded-md border border-slate-700 bg-slate-900/50 hover:border-[#F4C624]/50 transition-all">
                    <p className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-2 mb-1">
                      {dom.icon} {dom.label}
                    </p>
                    <div className="flex items-center justify-between">
                      <code className="text-sm text-slate-300 break-all font-mono">{dom.value}</code>
                      <button className="text-slate-500 hover:text-[#F4C624] transition-colors ml-2">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <CardContent>
                    <CardTitle className="text-xl text-white mb-2">{tool.name}</CardTitle>
                    <CardDescription className="text-slate-400 mb-6 h-12">
                      {tool.desc}
                    </CardDescription>
                    <a 
                      href={tool.url} 
                      target="_blank" 
                      className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-transparent border border-[#F4C624] text-[#F4C624] font-bold hover:bg-[#F4C624] hover:text-[#084218] transition-all"
                    >
                      Open Dashboard <ExternalLink size={14} />
                    </a>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}

export default App;