import { masterData } from '../data/masterData';

const safeCommunityImages = [
    "https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=800&q=80", // Nature water
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80", // Mountain lake
    "https://images.unsplash.com/photo-1437482078695-73f5bd6f4e24?w=800&q=80", // River stream
    "https://images.unsplash.com/photo-1470071131384-001b85755536?w=800&q=80", // Forest lake
    "https://images.unsplash.com/photo-1542224566-6e85f2e10ce3?w=800&q=80", // Waterfall
    "https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6?w=800&q=80", // Ocean
    "https://images.unsplash.com/photo-1439405326854-01460775a2d1?w=800&q=80", // Coastal / Wetlands
    "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80", // Clear water lake
    "https://images.unsplash.com/photo-1456082902841-3335005c3082?w=800&q=80", // Dam / Reservoir
    "https://images.unsplash.com/photo-1518182170546-076616fdceae?w=800&q=80"  // Rainwater feeling
];

const safeCorporateImages = [
    "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80", // Corp building
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80", // Business building
    "https://images.unsplash.com/photo-1516937941344-00b4e0337589?w=800&q=80", // Industrial
    "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80", // Industrial plant
    "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80", // Lab/Industry
    "https://images.unsplash.com/photo-1536244636800-a3f74db0f3cf?w=800&q=80", // Pipes/Water station
    "https://images.unsplash.com/photo-1581093458791-9d09c8a3a7b6?w=800&q=80", // Factory equipment
    "https://images.unsplash.com/photo-1590856029826-c7a73142bbf1?w=800&q=80", // Water treatment plant
    "https://images.unsplash.com/photo-1533483595632-c5f0e57a1936?w=800&q=80", // Water bottles/production
    "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=800&q=80"  // Filtration
];

export const seedLocalStorage = (): boolean => {
  if (!masterData) return false;
  
  if (localStorage.getItem('hydrex-seeded-v5') === 'true') {
     return false; 
  }
  
  console.log("Seeding local storage from master data (v5, strict verifications)...");
  const md = masterData as any;

  let totalMapped = 0; // Out of 20 exactly

  // 1. Map Projects
  const communityProjects = (md['01_Community_Projects'] || []).map((p:any, i:number) => {
      // Force 17 VERIFIED and 3 PENDING globally: we will make the LAST 3 projects (totalMapped 17, 18, 19) pending.
      // With 10 community and 10 corporate, the pending ones will be the last 3 corporate ones.
      const isVerified = totalMapped < 17;
      totalMapped++;

      return {
          id: p['Project ID'] || `PROJ-C-${i}`,
          category: "community",
          title: p['Project Name'] || "Unknown Project",
          description: p['Project Description'] || `Community conservation project in ${p['Province'] || "Unknown location"}.`,
          projectType: "conservation",
          location: { 
              province: p['Province'] || "Kalimantan", 
              regency: p['Regency'] || "", 
              district: p['District'] || "", 
              village: p['Village'] || "", 
              coordinates: { lat: Number(p['Lat Center'] || 0), lng: Number(p['Lon Center'] || 0) } 
          },
          areaHectares: Number(p['Area (ha)'] || 1000),
          startDate: p['Start Date'] ? new Date(p['Start Date']).toISOString() : new Date().toISOString(),
          endDate: p['End Date'] ? new Date(p['End Date']).toISOString() : new Date(Date.now() + 10 * 365 * 24 * 3600 * 1000).toISOString(),
          creditingPeriodYears: Number(p['Duration (yr)'] || 10),
          status: isVerified ? 'verified' : 'under_verification',
          progress: isVerified ? 100 : 50,
          waterData: {
              estimatedCredits: Number(p['Est. Credits/yr (m³)'] || 0),
              verifiedCredits: isVerified ? Number(p['Net Credits/yr (m³)'] || p['Est. Credits/yr (m³)'] || 0) : 0,
              baselineConsumption: Number(p['Baseline m³/yr (avg)'] || 0),
              projectConsumption: 0,
              leakageConsumption: 0,
              netReduction: Number(p['Net Credits/yr (m³)'] || 0) || Number(p['Est. Credits/yr (m³)'] || 0),
              pricePerCredit: Number(p['Price/m³ (USD)'] || 10),
              creditsAvailable: Number(p['Net Credits/yr (m³)'] || p['Est. Credits/yr (m³)'] || 0)
          },
          currency: "USD",
          certificationStandard: p['Cert. Standard'] || "Verra VCS",
          methodology: p['Methodology'] || "Wetland & Mangrove Restoration",
          owner: p['Developer Org'] || "Unknown Developer",
          ownerEmail: p['Developer Contact'] || "admin@hydrex.com",
          ownerCompany: p['Developer Org'] || "Unknown",
          ownerRole: "company",
          team: [],
          coverImage: safeCommunityImages[i % safeCommunityImages.length],
          galleryImages: [],
          documents: [p['Land Cert Doc'], p['Env Permit Doc']].filter(Boolean),
          verificationStatus: isVerified ? 'verified' : 'pending',
          verificationSteps: [],
          verificationHistory: [],
          listedInMarketplace: true,
          sellerVerified: true,
          blockchainRecords: [],
          createdAt: p['Submission Date'] ? new Date(p['Submission Date']).toISOString() : new Date().toISOString(),
          updatedAt: new Date().toISOString()
      };
  });

  const corporateProjects = (md['02_Corporate_Projects'] || []).map((p:any, i:number) => {
    const isBuyer = p['Trading Intent'] === 'Buy Quota';
    const isVerified = totalMapped < 17;
    totalMapped++;

    return {
      id: p['Program ID'] || `PROJ-Corp-${i}`,
      category: "corporate",
      title: p['Program Name'] || p['Company Legal Name'] || "Corporate Water Program",
      description: p['Program Description'] || "Corporate water consumption reporting and quota limits.",
      projectType: "water_quota_trading",
      location: { province: p['Province'] || "Java", regency: p['Regency'] || "", district: "", village: "", coordinates: {lat:0, lng:0} },
      areaHectares: 0,
      startDate: new Date().toISOString(),
      endDate: new Date().toISOString(),
      creditingPeriodYears: 1,
      status: isVerified ? "verified" : "under_verification",
      progress: isVerified ? 100 : 50,
      waterData: {
          estimatedCredits: isBuyer ? 0 : Number(p['Surplus (+) / Deficit (-) m³'] || 0),
          verifiedCredits: isVerified ? (isBuyer ? 0 : Number(p['Surplus Available for Market'] || 0)) : 0,
          baselineConsumption: Number(p['Official Quota (m³/yr)'] || 0),
          projectConsumption: Number(p['Actual Consumption (m³/yr)'] || 0),
          leakageConsumption: 0,
          netReduction: 0,
          pricePerCredit: Number(p['Price/m³ (USD)'] || 15),
          creditsAvailable: isBuyer ? 0 : Number(p['Surplus Available for Market'] || 0),
      },
      currency: "USD",
      certificationStandard: "ISO 14046",
      methodology: "Corporate Water Standard",
      owner: p['Company Legal Name'],
      ownerEmail: "corp@example.com",
      ownerCompany: p['Company Legal Name'],
      ownerRole: "company",
      team: [],
      coverImage: safeCorporateImages[i % safeCorporateImages.length],
      galleryImages: [],
      documents: [p['Supporting Documents']].filter(Boolean),
      verificationStatus: isVerified ? 'verified' : 'pending',
      verificationSteps: [],
      verificationHistory: [],
      listedInMarketplace: !isBuyer,
      sellerVerified: true,
      blockchainRecords: [],
      createdAt: p['Submission Date'] ? new Date(p['Submission Date']).toISOString() : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      corporateData: {
          currentWaterQuota: Number(p['Official Quota (m³/yr)'] || 0),
          actualConsumption: Number(p['Actual Consumption (m³/yr)'] || 0),
          surplusDeficit: Number(p['Surplus (+) / Deficit (-) m³'] || 0),
          tradingIntent: isBuyer ? 'buy' : 'sell',
          pricePerM3: Number(p['Price/m³ (USD)'] || 15),
          companySize: p['Company Size'] || "large",
          industry: p['Industry'] || "Manufacturing",
          complianceStatus: p['Env. Compliance'] === 'Compliant' ? 'compliant' : 'non_compliant'
      }
    };
  });

  const allProjects = [...communityProjects, ...corporateProjects];
  
  // 2. Map Listings
  const marketplaceListings = (md['10_Marketplace_Listings'] || md['04_Marketplace'] || []).map((l:any, i:number) => {
      const isCorp = l['Proj. Type'] === 'Corporate';
      const imgPool = isCorp ? safeCorporateImages : safeCommunityImages;
      return {
          id: l['Listing ID'] || `LIST-${i}`,
          listingCategory: isCorp ? "corporate" : "community",
          sellerId: `USR-${i}`,
          sellerName: l['Seller/Buyer Org'] || "HydrEx Partner",
          sellerType: "company",
          sellerVerified: true,
          projectId: l['Project ID'] || (isCorp ? `HYD-COR-${i}` : `HYD-COM-${i}`),
          projectName: l['Project/Program Name'] || "Verified Water Credit",
          projectDescription: l['Co-Benefits'] || "Verified offset credits. Standard: " + (l['Cert. Standard'] || 'VCS'),
          location: { province: "Verified Region", country: "Indonesia" },
          availableCredits: Number(l['Available (m³)'] || 0),
          totalCredits: Number(l['Total Credits (m³)'] || 0),
          pricePerTon: Number(l['Price/m³ (USD)'] || 10),
          minimumPurchase: Number(l['Min Order (m³)'] || 100),
          isVerified: true,
          verificationDate: l['Listed Date'] ? new Date(l['Listed Date']).toISOString() : new Date().toISOString(),
          verificationBody: l['VVB/Auditor'] || "HydrEx Authorized VVB",
          coverImage: imgPool[i % imgPool.length],
          galleryImages: [],
          documents: [],
          rating: 4.8,
          totalSold: Number(l['Total Credits (m³)'] || 0) - Number(l['Available (m³)'] || 0),
          reviewCount: 15 + i,
          status: String(l['Listing Status']).toLowerCase().includes('active') ? 'active' : 'sold',
          createdAt: l['Listed Date'] ? new Date(l['Listed Date']).toISOString() : new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          featured: i < 3,
          promoted: i === 0,
          
          ...(isCorp ? {
              projectType: "water_quota_trading",
              companyIndustry: "Manufacturing",
              companySize: "large",
              tradingIntent: "sell",
              currentWaterQuota: Number(l['Total Credits (m³)'] || 0),
              actualConsumption: 0,
              surplusDeficit: Number(l['Available (m³)'] || 0),
              complianceStatus: "compliant"
          } : {
              projectType: "conservation",
              certificationStandard: l['Cert. Standard'] || "Gold Standard",
              methodology: l['Credit Type'] || "Restoration",
              vintageYear: new Date().getFullYear()
          })
      }
  });

  // 3. Transactions 
  const txs = (md['11_Transactions'] || md['05_Transactions'] || []).map((t:any, i:number) => ({
      id: t['TX ID'] || `TXN-100-${i}`,
      buyerId: `BUYER-${i}`,
      buyerName: t['Buyer Organization'] || "Anonymous Buyer",
      buyerEmail: "buyer@example.com",
      items: [{
          listingId: t['Listing ID'] || `LIST-${i}`,
          listingCategory: t['Proj. Type'] === 'Corporate' ? "corporate" : "community",
          projectName: t['Project ID'] || "Water Credit Purchase",
          sellerName: t['Seller Organization'] || "HydrEx Verified Seller",
          quantity: Number(t['Volume (m³)'] || 0),
          pricePerTon: Number(t['Price/m³ (USD)'] || 10),
          subtotal: Number(t['Gross Value (USD)'] || 1000)
      }],
      subtotal: Number(t['Gross Value (USD)'] || 1000),
      serviceFee: Number(t['Platform Fee 2.5% (USD)'] || 0),
      tax: 0,
      total: Number(t['Gross Value (USD)'] || 1000),
      paymentMethod: t['Payment Method'] || "bank_transfer",
      paymentStatus: t['TX Status'] === 'Confirmed' ? 'completed' : 'pending',
      createdAt: t['Timestamp'] ? new Date(t['Timestamp']).toISOString() : new Date().toISOString(),
      blockchainTxHash: t['Blockchain TX Hash'] || "0x..."
  }));

  // 4. ESG Scorings 
  const esgs = (md['09_ESG_Final_Score'] || md['06_ESG_Scoring'] || []).map((e:any, i:number) => ({
      id: `ESG-${i}`,
      projectId: e['Project ID'] || `PROJ-Corp-${i}`,
      projectTitle: e['Project Name'] || e['Company_Project_Name'],
      projectCategory: String(e['Type']).toLowerCase() === 'corporate' ? "corporate" : "community",
      overallScore: Number(e['ESG TOTAL (0-100)'] || 70),
      eScore: Number(e['E Score'] || 70),
      sScore: Number(e['S Score'] || 70),
      gScore: Number(e['G Score'] || 70),
      grade: e['ESG Grade'] || "C",
      status: String(e['Credit Premium']).includes('Yes') ? 'eligible' : 'conditional',
      locked: true,
      indicators: [],
      evidenceCompleteness: 100,
      totalEvidence: 10,
      verifiedEvidence: 10,
      evidenceList: [],
      risks: [],
      keyRedFlags: [e['vs National Avg (60)']].filter(Boolean),
      history: [],
      weights: { E: 40, S: 35, G: 25 },
      gateChecks: { hasBaseline: true, hasMRVPlan: true, hasPermits: true, hasGrievanceMechanism: true, noMajorConflicts: true },
      createdAt: new Date().toISOString(),
      updatedAt: e['Next Review'] ? new Date(e['Next Review']).toISOString() : new Date().toISOString(),
      version: 1,
      notifiedInMarketplace: true,
      marketplaceVisibility: true
  }));

  localStorage.removeItem('hydrex-projects-v2');
  localStorage.removeItem('hydrex-marketplace-listings-v2');
  localStorage.removeItem('hydrex-marketplace-transactions-v2');
  localStorage.removeItem('hydrex-esg-scorings-v2');

  localStorage.setItem('hydrex-projects-v2', JSON.stringify(allProjects));
  localStorage.setItem('hydrex-marketplace-listings-v2', JSON.stringify(marketplaceListings));
  localStorage.setItem('hydrex-marketplace-transactions-v2', JSON.stringify(txs));
  localStorage.setItem('hydrex-esg-scorings-v2', JSON.stringify(esgs));
  
  localStorage.setItem('hydrex-seeded-v5', 'true');
  console.log("Successfully seeded localStorage with Safe Photos and 17/3 Validation (v5)!");
  return true;
};
