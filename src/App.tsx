import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { ExternalLink } from 'lucide-react';
import { useEffect } from "react";

function App() {
  const captainDomain = import.meta.env.CAPTAIN_DOMAIN || 'CAPTAIN_DOMAIN_PLACEHOLDER';
  const appsDomain = `*.apps.${captainDomain}`;
  const traefikPublicDomain = `public-v2.${captainDomain}`;
  const traefikInternalDomain = `internal-v2.${captainDomain}`;
  const argocdUrl = `https://argocd.${captainDomain}`;
  const grafanaUrl = `https://grafana.${captainDomain}`;
  const vaultUrl = `https://vault.${captainDomain}`;

  useEffect(() => {
    document.title = `GlueOps - ${captainDomain}`;

    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in');
        }
      });
    }, observerOptions);

    document.querySelectorAll('tr').forEach(row => {
      observer.observe(row);
    });

    return () => {
      observer.disconnect();
    };
  }, [captainDomain])


  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header Section - GlueOps Style */}
      <div className="py-20 text-center relative overflow-hidden bg-linear-to-r from-slate-900 via-slate-800 to-slate-900">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"
        }}/>
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="inline-flex items-center rounded-full px-6 py-3 mb-8 border-2 bg-[#F4C624]/20 backdrop-blur-sm border-[#F4C624]/30">
            <img src="/logo.png" alt="GlueOps" className="w-8 h-8 mr-3" />
            <span className="text-white text-lg font-semibold">GlueOps Platform</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Cluster Dashboard
          </h1>
          <p className="text-xl text-[#F4C624] max-w-3xl mx-auto leading-relaxed mb-2">
            SIMPLIFY SCALING. MAXIMIZE PERFORMANCE
          </p>
          <p className="text-lg text-white/90 max-w-3xl mx-auto leading-relaxed">
            Your complete platform operations center. Access all your cluster resources, monitoring tools, and management interfaces in one place.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Emergency Contact Card */}
        <Card className="mb-12 border-[#F4C624]/20 shadow-2xl hover:shadow-3xl transition-all relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full -translate-y-16 translate-x-16 bg-linear-to-br from-[#F4C624]/20 to-[#F4C624]/20" />
          <CardContent className="flex flex-col md:flex-row md:items-center gap-8 z-10 relative p-8">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg" style={{ backgroundColor: '#084218' }}>
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <h3 className="text-3xl font-bold text-[#084218]">Emergency Support</h3>
              </div>
              <div className="text-xl text-slate-700 mb-8">
                <strong className="font-bold text-[#084218]">24/7 Phone Support:</strong>
                <span className="font-bold ml-3 text-2xl text-[#F4C624]">+1-877-GLUE-OPS</span>
              </div>
              <div>
                <a
                  href="https://docs.glueops.dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 font-bold text-lg text-[#084218] hover:text-[#F4C624] transition-colors"
                >
                  GlueOps Documentation
                  <ExternalLink size={16} />
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resources Table */}
        <Card className="overflow-hidden border-[#F4C624]/20 shadow-2xl">
          <div className="px-8 py-10 border-b border-[#F4C624]/30 bg-linear-to-r from-[#084218] to-[#084218]/90">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg bg-[#F4C624]">
                <svg className="w-6 h-6 text-[#084218]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h2 className="text-4xl font-bold text-[#F4C624]">Platform Resources</h2>
            </div>
            <p className="text-xl font-medium text-white/90">Access your cluster resources and management tools</p>
          </div>

          <div className="overflow-x-none">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-8 py-8 text-left text-xl font-bold bg-[#084218] text-white">Resource Type</TableHead>
                  <TableHead className="px-8 py-8 text-left text-xl font-bold bg-[#084218] text-white">Description</TableHead>
                  <TableHead className="px-8 py-8 text-left text-xl font-bold bg-[#084218] text-white">Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-[#F4C624]/20">
                {[
                  {
                    name: "Captain Domain:",
                    desc: "The unique root domain assigned to this specific cluster. Refer to this value wherever CAPTAIN_DOMAIN appears in the documentation.",
                    value: captainDomain,
                  },
                  {
                    name: "Applications Domain:",
                    desc: "The default base domain for your application Ingress entries. It is pre-configured with automatic SSL termination.",
                    value: appsDomain,
                  },
                  {
                    name: "Public Load Balancer:",
                    desc: "The external entry point for public web apps. Use this hostname as the CNAME target for your custom domains. SSL is supported via HTTP-01 challenges or pre-loaded certificates.",
                    value: traefikPublicDomain,
                  },
                  {
                    name: "Internal Load Balancer:",
                    desc: "The entry point for internal/private applications. Use this hostname as the CNAME target for internal custom domains. SSL is supported via pre-loaded certificates only.",
                    value: traefikInternalDomain,
                  },
                  {
                    name: "Deployments:",
                    desc: "Manage and visualize your application deployments.",
                    value: <a href={argocdUrl} target="_blank" className="inline-flex items-center gap-2 text-[#084218] hover:text-[#F4C624]">{argocdUrl} <ExternalLink size={16} /></a>
                  },
                  {
                    name: "Observability:",
                    desc: "View application logs, metrics, and system performance (CPU, Memory, etc.).",
                    value: <a href={grafanaUrl} target="_blank" className="inline-flex items-center gap-2 text-[#084218] hover:text-[#F4C624]">{grafanaUrl} <ExternalLink size={16} /></a>
                  },
                  {
                    name: "Secrets Management:",
                    desc: "Securely manage your application secrets and sensitive data.",
                    value: <a href={vaultUrl} target="_blank" className="inline-flex items-center gap-2 text-[#084218] hover:text-[#F4C624]">{vaultUrl} <ExternalLink size={16} /></a>
                  },
                ].map((item, idx) => (
                  <TableRow key={idx} className="hover:bg-linear-to-r hover:from-[#F4C624]/10 hover:to-[#F4C624]/20 transition-all">
                    <TableCell className="px-8 py-10 font-bold text-lg text-[#084218]">{item.name}</TableCell>
                    <TableCell className="px-8 py-10 text-slate-600 text-lg whitespace-normal wrap-break-word min-w-50">{item.desc}</TableCell>
                    <TableCell className="px-8 py-10 font-mono text-lg text-slate-700 select-all">{item.value}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

    </div>
  )
}

export default App
