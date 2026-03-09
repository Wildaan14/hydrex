import React, { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Globe, TrendingUp, DollarSign, Filter, Search, Info } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

// Type definitions
interface WaterPricingItem {
  id: string;
  name: string;
  type: string;
  region: string;
  jurisdiction: string;
  price_2024: number | null;
  price_2025: number | null;
}

interface WaterPricingData {
  last_updated: string;
  total_instruments: number;
  regions: {
    [key: string]: WaterPricingItem[];
  };
  all_data: WaterPricingItem[];
}

const WaterPricingRegulations: React.FC = () => {
  const { language } = useLanguage();
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [waterPricingData, setWaterPricingData] = useState<WaterPricingData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/water_pricing_data.json');
        if (response.ok) {
          const data = await response.json();
          setWaterPricingData(data);
        } else {
          setWaterPricingData(getSampleData());
        }
      } catch (error) {
        console.error('Error loading water pricing data:', error);
        setWaterPricingData(getSampleData());
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const texts = {
    id: {
      title: "Regulasi Water Pricing Global",
      subtitle: "Data terkini tentang sistem perdagangan air, pajak air, dan mekanisme penetapan harga air di seluruh dunia",
      lastUpdated: "Terakhir diperbarui",
      totalInstruments: "Total Instrumen",
      search: "Cari negara atau instrumen...",
      filterRegion: "Filter Wilayah",
      filterType: "Filter Tipe",
      allRegions: "Semua Wilayah",
      allTypes: "Semua Tipe",
      jurisdiction: "Yurisdiksi",
      currentPrice: "Harga Saat Ini",
      priceChange: "Perubahan Harga",
      type: "Tipe",
      noData: "Tidak ada data yang sesuai dengan filter",
      loading: "Memuat data...",
      about: {
        title: "Tentang Water Pricing",
        ets: {
          title: "Water Trading Systems",
          desc: "Sistem water allocation trading yang menetapkan batas total konsumsi air dan mengizinkan perdagangan kuota konsumsi air antar entitas."
        },
        tax: {
          title: "Pajak Air",
          desc: "Pajak langsung yang dikenakan pada kandungan karbon dari sumber daya air, mendorong pengurangan konsumsi air."
        },
        crediting: {
          title: "Mekanisme Kredit Air",
          desc: "Sistem yang memberikan kredit untuk pengurangan atau penyerapan konsumsi air yang dapat diperdagangkan atau digunakan untuk offset."
        }
      },
      stats: {
        avgETS: "Rata-rata Harga ETS",
        avgTax: "Rata-rata Pajak Air",
        coverage: "Cakupan Global",
        instruments: "Instrumen Aktif"
      }
    },
    en: {
      title: "Global Water Pricing Regulations",
      subtitle: "Current data on water trading systems, water taxes, and water pricing mechanisms worldwide",
      lastUpdated: "Last updated",
      totalInstruments: "Total Instruments",
      search: "Search country or instrument...",
      filterRegion: "Filter Region",
      filterType: "Filter Type",
      allRegions: "All Regions",
      allTypes: "All Types",
      jurisdiction: "Jurisdiction",
      currentPrice: "Current Price",
      priceChange: "Price Change",
      type: "Type",
      noData: "No data matches the current filters",
      loading: "Loading data...",
      about: {
        title: "About Water Pricing",
        ets: {
          title: "Water Trading Systems",
          desc: "Cap-and-trade systems that set a total emissions limit and allow trading of emission allowances between entities."
        },
        tax: {
          title: "Carbon Tax",
          desc: "Direct tax imposed on the carbon content of fossil fuels, encouraging emissions reduction."
        },
        crediting: {
          title: "Carbon Credit Mechanisms",
          desc: "Systems that award credits for emissions reductions or removals that can be traded or used for offsetting."
        }
      },
      stats: {
        avgETS: "Average ETS Price",
        avgTax: "Average Carbon Tax",
        coverage: "Global Coverage",
        instruments: "Active Instruments"
      }
    }
  };

  const t = texts[language];

  const filteredData = useMemo(() => {
    if (!waterPricingData) return [];
    
    let data = waterPricingData.all_data;

    if (selectedRegion !== "all") {
      data = data.filter((item) => item.region === selectedRegion);
    }

    if (selectedType !== "all") {
      data = data.filter((item) => item.type === selectedType);
    }

    if (searchTerm) {
      data = data.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.jurisdiction.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return data;
  }, [waterPricingData, selectedRegion, selectedType, searchTerm]);

  const stats = useMemo(() => {
    const etsData = filteredData.filter((item) => item.type === "ETS");
    const taxData = filteredData.filter((item) => item.type === "Water tax");

    const avgETSPrice = etsData.reduce((sum, item) => {
      const price = item.price_2025 || item.price_2024 || 0;
      return sum + price;
    }, 0) / (etsData.length || 1);

    const avgTaxPrice = taxData.reduce((sum, item) => {
      const price = item.price_2025 || item.price_2024 || 0;
      return sum + price;
    }, 0) / (taxData.length || 1);

    return {
      avgETS: avgETSPrice,
      avgTax: avgTaxPrice,
      totalInstruments: filteredData.length
    };
  }, [filteredData]);

  const regions = waterPricingData ? Object.keys(waterPricingData.regions) : [];
  const types = ["ETS", "Water tax"];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] py-12 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-400">{t.loading}</p>
        </div>
      </div>
    );
  }

  if (!waterPricingData) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] py-12 px-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400">Failed to load data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <Globe className="w-12 h-12 text-emerald-400" />
            {t.title}
          </h1>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto">{t.subtitle}</p>
          <p className="text-gray-500 text-sm mt-2">
            {t.lastUpdated}: {waterPricingData.last_updated}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl p-5 text-white">
            <p className="text-sm opacity-80 mb-1">{t.stats.instruments}</p>
            <p className="text-3xl font-bold">{stats.totalInstruments}</p>
          </div>
          <div className="bg-[#111113] border border-white/10 rounded-xl p-5">
            <p className="text-sm text-gray-400 mb-1">{t.stats.avgETS}</p>
            <p className="text-3xl font-bold text-white">${stats.avgETS.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-1">per tCO₂</p>
          </div>
          <div className="bg-[#111113] border border-white/10 rounded-xl p-5">
            <p className="text-sm text-gray-400 mb-1">{t.stats.avgTax}</p>
            <p className="text-3xl font-bold text-white">${stats.avgTax.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-1">per tCO₂</p>
          </div>
          <div className="bg-[#111113] border border-white/10 rounded-xl p-5">
            <p className="text-sm text-gray-400 mb-1">{t.stats.coverage}</p>
            <p className="text-3xl font-bold text-white">{regions.length}</p>
            <p className="text-xs text-gray-500 mt-1">regions</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#111113] border border-white/10 rounded-xl p-6 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 flex items-center gap-2">
                <Search className="w-4 h-4" />
                {t.search}
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t.search}
                className="w-full px-4 py-3 bg-[#0a0a0b] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                {t.filterRegion}
              </label>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full px-4 py-3 bg-[#0a0a0b] border border-white/10 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="all">{t.allRegions}</option>
                {regions.map((region) => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                {t.filterType}
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-4 py-3 bg-[#0a0a0b] border border-white/10 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="all">{t.allTypes}</option>
                {types.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#111113] border border-white/10 rounded-xl p-6 mb-8"
        >
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Info className="w-6 h-6 text-emerald-400" />
            {t.about.title}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#0a0a0b] rounded-lg p-4">
              <h3 className="font-semibold text-emerald-400 mb-2">{t.about.ets.title}</h3>
              <p className="text-gray-400 text-sm">{t.about.ets.desc}</p>
            </div>
            <div className="bg-[#0a0a0b] rounded-lg p-4">
              <h3 className="font-semibold text-blue-400 mb-2">{t.about.tax.title}</h3>
              <p className="text-gray-400 text-sm">{t.about.tax.desc}</p>
            </div>
            <div className="bg-[#0a0a0b] rounded-lg p-4">
              <h3 className="font-semibold text-purple-400 mb-2">{t.about.crediting.title}</h3>
              <p className="text-gray-400 text-sm">{t.about.crediting.desc}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-[#111113] border border-white/10 rounded-xl overflow-hidden"
        >
          {filteredData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#0a0a0b] border-b border-white/10">
                  <tr>
                    <th className="text-left py-4 px-6 text-gray-400 font-medium">{t.jurisdiction}</th>
                    <th className="text-left py-4 px-6 text-gray-400 font-medium">Instrument</th>
                    <th className="text-left py-4 px-6 text-gray-400 font-medium">{t.type}</th>
                    <th className="text-right py-4 px-6 text-gray-400 font-medium">{t.currentPrice}</th>
                    <th className="text-right py-4 px-6 text-gray-400 font-medium">{t.priceChange}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filteredData.map((item, index) => {
                    const price2024 = item.price_2024 || 0;
                    const price2025 = item.price_2025 || price2024;
                    const priceChange = price2024 ? ((price2025 - price2024) / price2024) * 100 : 0;

                    return (
                      <motion.tr
                        key={item.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.02 }}
                        className="hover:bg-white/5 transition-colors"
                      >
                        <td className="py-4 px-6">
                          <div>
                            <p className="text-white font-medium">{item.jurisdiction}</p>
                            <p className="text-gray-500 text-xs">{item.region}</p>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-gray-300">{item.name}</td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                              item.type === "ETS"
                                ? "bg-emerald-500/20 text-emerald-400"
                                : "bg-blue-500/20 text-blue-400"
                            }`}
                          >
                            {item.type}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div>
                            <p className="text-white font-bold text-lg">
                              ${price2025.toFixed(2)}
                            </p>
                            <p className="text-gray-500 text-xs">per tCO₂</p>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-right">
                          {price2024 && price2025 !== price2024 ? (
                            <div className={`flex items-center justify-end gap-1 ${
                              priceChange > 0 ? "text-green-400" : "text-red-400"
                            }`}>
                              <TrendingUp
                                className={`w-4 h-4 ${priceChange < 0 ? "rotate-180" : ""}`}
                              />
                              <span className="font-medium">
                                {priceChange > 0 ? "+" : ""}{priceChange.toFixed(1)}%
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-500">—</span>
                          )}
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-gray-500">{t.noData}</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

function getSampleData(): WaterPricingData {
  return {
    last_updated: "April 1, 2025",
    total_instruments: 10,
    regions: {
      "North America": [],
      "Europe": [],
      "Asia": []
    },
    all_data: [
      {
        id: "sample_1",
        name: "Sample ETS",
        type: "ETS",
        region: "North America",
        jurisdiction: "Sample Country",
        price_2024: 50.0,
        price_2025: 55.0
      }
    ]
  };
}

export default WaterPricingRegulations;
