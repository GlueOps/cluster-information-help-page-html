
import { useEffect } from 'react';
import { ExternalLink } from 'lucide-react';

const ClusterInfo = () => {
  // Get environment variables with fallback defaults
  const captainDomain = import.meta.env.CAPTAIN_DOMAIN || 'CAPTAIN_DOMAIN_PLACEHOLDER';
  const appsDomain = `apps.${captainDomain}`;
  const argocdUrl = `https://argocd.${captainDomain}`;
  const grafanaUrl = `https://grafana.${captainDomain}`;
  const vaultUrl = `https://vault.${captainDomain}`;

  useEffect(() => {
    // Set the document title to the CAPTAIN_DOMAIN
    document.title = "GlueOps - " + captainDomain;

    // Add fade-in animation to elements when they come into view
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in');
        }
      });
    }, observerOptions);

    // Observe all table rows
    document.querySelectorAll('tr').forEach(row => {
      observer.observe(row);
    });

    return () => {
      observer.disconnect();
    };
  }, [captainDomain]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header Section - GlueOps Style */}
      <div className="py-20 text-center relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"
        }}></div>
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="inline-flex items-center rounded-full px-6 py-3 mb-8 border-2 bg-[#F4C624]/20 backdrop-blur-sm border-[#F4C624]/30">
            <img src="https://cdn.glueops.dev/logos/logo.png" alt="GlueOps" className="w-8 h-8 mr-3" />
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
        <div className="bg-white rounded-3xl p-8 mb-12 shadow-2xl border border-[#F4C624]/20 hover:shadow-3xl transition-all duration-500 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full -translate-y-16 translate-x-16 bg-gradient-to-br from-[#F4C624]/20 to-[#F4C624]/20"></div>
          <div className="flex flex-col md:flex-row md:items-center gap-8 relative z-10">
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
                <span className="font-bold ml-3 text-2xl text-[#F4C624]">
                  +1-877-GLUE-OPS
                </span>
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
          </div>
        </div>

        {/* Resources Table */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-2xl border border-[#F4C624]/20">
          {/* Table Header */}
          <div className="px-8 py-10 border-b border-[#F4C624]/30 bg-gradient-to-r from-[#084218] to-[#084218]/90">
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
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-white bg-[#084218]">
                  <th className="px-8 py-8 text-left font-bold text-xl">
                    Resource Type
                  </th>
                  <th className="px-8 py-8 text-left font-bold text-xl">
                    Description
                  </th>
                  <th className="px-8 py-8 text-left font-bold text-xl">
                    Value
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4C624]/20">
                <tr className="transition-all duration-300 hover:bg-gradient-to-r hover:from-[#F4C624]/10 hover:to-[#F4C624]/20">
                  <td className="px-8 py-10 font-bold min-w-64 text-lg text-[#084218]">
                    Captain Domain:
                  </td>
                  <td className="px-8 py-10">
                    <p className="text-slate-600 leading-relaxed text-lg">
                      You will find this referenced throughout the docs. This is specific to a cluster
                    </p>
                  </td>
                  <td className="px-8 py-10">
                    <div className="font-mono text-lg text-slate-700 select-all">
                      {captainDomain}
                    </div>
                  </td>
                </tr>
                <tr className="transition-all duration-300 hover:bg-gradient-to-r hover:from-[#F4C624]/10 hover:to-[#F4C624]/20">
                  <td className="px-8 py-10 font-bold text-lg text-[#084218]">
                    Applications Domain:
                  </td>
                  <td className="px-8 py-10">
                    <p className="text-slate-600 leading-relaxed text-lg">
                      When creating ingress entries for your web apps. This Applications Domain is already configured to your cluster and will provide immediate SSL
                    </p>
                  </td>
                  <td className="px-8 py-10">
                    <div className="font-mono text-lg text-slate-700 select-all">
                      {appsDomain}
                    </div>
                  </td>
                </tr>
                <tr className="transition-all duration-300 hover:bg-gradient-to-r hover:from-[#F4C624]/10 hover:to-[#F4C624]/20">
                  <td className="px-8 py-10 font-bold text-lg text-[#084218]">
                    Deployments:
                  </td>
                  <td className="px-8 py-10">
                    <p className="text-slate-600 leading-relaxed text-lg">
                      View all your application deployments
                    </p>
                  </td>
                  <td className="px-8 py-10">
                    <a 
                      href={argocdUrl}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 font-medium text-lg text-[#084218] hover:text-[#F4C624] transition-colors"
                    >
                      {argocdUrl}
                      <ExternalLink size={16} />
                    </a>
                  </td>
                </tr>
                <tr className="transition-all duration-300 hover:bg-gradient-to-r hover:from-[#F4C624]/10 hover:to-[#F4C624]/20">
                  <td className="px-8 py-10 font-bold text-lg text-[#084218]">
                    Observability:
                  </td>
                  <td className="px-8 py-10">
                    <p className="text-slate-600 leading-relaxed text-lg">
                      View all your application deployment metrics (e.g. CPU, Memory, etc.)
                    </p>
                  </td>
                  <td className="px-8 py-10">
                    <a 
                      href={grafanaUrl}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 font-medium text-lg text-[#084218] hover:text-[#F4C624] transition-colors"
                    >
                      {grafanaUrl}
                      <ExternalLink size={16} />
                    </a>
                  </td>
                </tr>
                <tr className="transition-all duration-300 hover:bg-gradient-to-r hover:from-[#F4C624]/10 hover:to-[#F4C624]/20">
                  <td className="px-8 py-10 font-bold text-lg text-[#084218]">
                    Secrets Management:
                  </td>
                  <td className="px-8 py-10">
                    <p className="text-slate-600 leading-relaxed text-lg">
                      Manage the secrets consumed by your applications.
                    </p>
                  </td>
                  <td className="px-8 py-10">
                    <a 
                      href={vaultUrl}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 font-medium text-lg text-[#084218] hover:text-[#F4C624] transition-colors"
                    >
                      {vaultUrl}
                      <ExternalLink size={16} />
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClusterInfo;
