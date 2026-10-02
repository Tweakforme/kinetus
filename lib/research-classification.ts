/**
 * The client's "Classification Outline" (Research Tab/Classification Outline.docx),
 * copied verbatim: six categories, each a Research Material | Description table. The
 * document lists Thymalin twice under Longevity & Cellular Aging with different
 * descriptions; both are kept as written. Icons are the document's own, in order.
 */

export type ClassificationRow = { material: string; description: string };

export type ClassificationCategory = {
  /** Category collection slug, also the icon file name. */
  slug: string;
  number: string;
  title: string;
  icon: string;
  rows: ClassificationRow[];
};

export const RESEARCH_CLASSIFICATION: ClassificationCategory[] = [
  {
    slug: "metabolic-weight-management",
    number: "01",
    title: "Metabolic & Weight Management",
    icon: "/images/research/icons/metabolic-weight-management.webp",
    rows: [
      {
        material: "Retatrutide (GLP-3/Reta)",
        description:
          "Investigated as a multi-receptor metabolic peptide targeting GLP-1, GIP, and glucagon pathways, with research focused on body weight, appetite regulation, glucose metabolism, and energy balance.",
      },
      {
        material: "Semaglutide",
        description:
          "A GLP-1 receptor agonist studied extensively for appetite regulation, glucose metabolism, and body-weight management.",
      },
      {
        material: "Tirzepatide",
        description:
          "A dual GIP/GLP-1 receptor agonist researched for metabolic regulation, appetite control, glucose homeostasis, and body composition.",
      },
      {
        material: "Survodutide",
        description:
          "An investigational dual GLP-1/glucagon receptor agonist being studied for weight management, metabolic health, and energy metabolism.",
      },
      {
        material: "Cagrilintide",
        description:
          "A long-acting amylin analogue investigated for appetite regulation, satiety, food intake, and body-weight research.",
      },
      {
        material: "AOD-9604",
        description:
          "A modified fragment of human growth hormone investigated primarily for effects on lipid metabolism and fat-loss pathways.",
      },
      {
        material: "Liraglutide",
        description:
          "A GLP-1 receptor agonist studied for glucose regulation, appetite control, satiety, and metabolic research.",
      },
      {
        material: "5-Amino-1MQ",
        description:
          "A small-molecule research compound investigated for NNMT inhibition and its potential effects on metabolic signaling, energy balance, and cellular metabolism.",
      },
      {
        material: "MOTS-C",
        description:
          "A mitochondrial-derived peptide being investigated for metabolic signaling, glucose utilization, mitochondrial function, and cellular energy regulation.",
      },
    ],
  },
  {
    slug: "tissue-repair-recovery",
    number: "02",
    title: "Tissue Repair & Recovery",
    icon: "/images/research/icons/tissue-repair-recovery.webp",
    rows: [
      {
        material: "BPC-157",
        description:
          "An experimental peptide extensively investigated in preclinical models for tissue repair, gastrointestinal function, angiogenesis, and inflammatory signaling.",
      },
      {
        material: "TB-500",
        description:
          "A research peptide related to thymosin beta-4, investigated for cellular migration, tissue remodeling, angiogenesis, and recovery processes.",
      },
      {
        material: "GHK-Cu",
        description:
          "A copper-binding peptide studied for extracellular-matrix remodeling, collagen-related pathways, skin biology, wound research, and tissue regeneration.",
      },
      {
        material: "KPV",
        description:
          "A short peptide derived from α-MSH investigated for inflammatory signaling, immune modulation, and gastrointestinal research.",
      },
      {
        material: "KLOW80",
        description:
          "A research formulation investigated within peptide and regenerative-research protocols involving tissue recovery and cellular signaling.",
      },
      {
        material: "Wolverine Blend",
        description:
          "A combination research formulation generally centered on BPC-157 and TB-500 research, designed to investigate complementary pathways associated with tissue repair and recovery.",
      },
      {
        material: "LL-37",
        description:
          "A naturally occurring antimicrobial peptide investigated for innate immune signaling, antimicrobial activity, inflammation, and tissue-repair mechanisms.",
      },
      {
        material: "GLOW-50",
        description:
          "A multi-component research formulation investigated for pathways associated with skin, connective tissue, recovery, and regenerative biology.",
      },
      {
        material: "GLOW-70",
        description:
          "A higher-strength GLOW research formulation investigated across regenerative, tissue-support, and cellular-repair pathways.",
      },
    ],
  },
  {
    slug: "longevity-cellular-aging",
    number: "03",
    title: "Longevity & Cellular Aging",
    icon: "/images/research/icons/longevity-cellular-aging.webp",
    rows: [
      {
        material: "5-Amino-1MQ",
        description:
          "Investigated as an NNMT inhibitor with research interest in cellular metabolism, energy balance, adipose biology, and metabolic aging.",
      },
      {
        material: "MOTS-C",
        description:
          "A mitochondrial-derived peptide being studied for mitochondrial signaling, metabolic regulation, glucose utilization, and cellular stress responses.",
      },
      {
        material: "Epitalon",
        description:
          "An experimental tetrapeptide investigated in aging research, including cellular senescence, telomere-related biology, and circadian mechanisms.",
      },
      {
        material: "NAD+",
        description:
          "A central cellular coenzyme involved in energy metabolism and redox reactions, extensively researched in relation to mitochondrial function, DNA repair, and cellular aging.",
      },
      {
        material: "Pinealon",
        description:
          "An experimental peptide studied in relation to cellular aging, gene-expression regulation, neurological biology, and longevity research.",
      },
      {
        material: "SS-31",
        description:
          "A mitochondria-targeted peptide investigated for mitochondrial membrane integrity, oxidative stress, cellular energy production, and mitochondrial dysfunction.",
      },
      {
        material: "Thymalin",
        description:
          "A thymic peptide preparation investigated in immunological, aging, and cellular-regulation research.",
      },
      {
        material: "FOXO4-DRI",
        description:
          "An experimental peptide investigated for its ability to interfere with FOXO4-p53 signaling and selectively target senescent-cell biology.",
      },
      {
        material: "AHK-Cu",
        description:
          "A copper-binding peptide researched primarily for skin biology, extracellular-matrix remodeling, collagen-related pathways, and tissue regeneration.",
      },
      {
        material: "Thymalin",
        description:
          "An experimental thymic peptide preparation investigated in immune regulation, cellular aging, and age-related biological processes.",
      },
    ],
  },
  {
    slug: "neurological-cognitive",
    number: "04",
    title: "Neurological & Cognitive",
    icon: "/images/research/icons/neurological-cognitive.webp",
    rows: [
      {
        material: "Cerebrolysin",
        description:
          "A neuropeptide-based preparation investigated for neuroprotective mechanisms, neuronal signaling, cognitive function, and recovery following neurological injury.",
      },
      {
        material: "DSIP",
        description:
          "Delta sleep-inducing peptide is an experimental neuropeptide studied in relation to sleep regulation, stress responses, and neurophysiological signaling.",
      },
      {
        material: "Selank",
        description:
          "A synthetic peptide analogue of tuftsin investigated for cognitive function, anxiety-related signaling, stress responses, and neuroprotection.",
      },
      {
        material: "Semax",
        description:
          "A synthetic ACTH(4–10) analogue investigated for cognitive function, neuroprotection, learning, memory, and neurological signaling.",
      },
      {
        material: "Semax/Selank Blend",
        description:
          "A research combination bringing together Semax and Selank pathways for investigation into cognition, focus, stress signaling, and neuroprotective mechanisms.",
      },
      {
        material: "N-Acetyl Selank",
        description:
          "A modified Selank research compound investigated for neurocognitive, stress-response, and neurological signaling pathways.",
      },
      {
        material: "N-Acetyl Semax Amidate",
        description:
          "A modified Semax analogue investigated for neurological signaling, cognitive function, neuroprotection, and related research applications.",
      },
      {
        material: "PE-22-28",
        description:
          "An experimental neuropeptide investigated for neurotrophic signaling, neuronal survival, cognitive function, and neuroprotective mechanisms.",
      },
    ],
  },
  {
    slug: "hormone-endocrine",
    number: "05",
    title: "Hormone & Endocrine",
    icon: "/images/research/icons/hormone-endocrine.webp",
    rows: [
      {
        material: "CJC-1295 No DAC",
        description:
          "A growth-hormone-releasing hormone analogue investigated for stimulation of endogenous growth-hormone signaling and endocrine research.",
      },
      {
        material: "CJC-1295 With DAC",
        description:
          "A long-acting GHRH analogue investigated for sustained growth-hormone and IGF-1 pathway activity.",
      },
      {
        material: "Ipamorelin",
        description:
          "A selective growth-hormone secretagogue investigated for stimulation of growth-hormone release while having relatively limited activity at other endocrine pathways.",
      },
      {
        material: "Sermorelin",
        description:
          "A GHRH analogue investigated for stimulating endogenous growth-hormone secretion and studying the GH/IGF-1 axis.",
      },
      {
        material: "Tesamorelin",
        description:
          "A GHRH analogue extensively studied for growth-hormone signaling, body-composition research, and visceral-adipose biology.",
      },
      {
        material: "GHRP-2",
        description:
          "A growth-hormone-releasing peptide investigated for stimulation of GH secretion and regulation of the GH/IGF-1 axis.",
      },
      {
        material: "GHRP-6",
        description:
          "A growth-hormone secretagogue studied for GH release and interactions with ghrelin-related endocrine pathways.",
      },
      {
        material: "Hexarelin",
        description:
          "A potent experimental growth-hormone secretagogue investigated for GH release, endocrine signaling, and cardiovascular research.",
      },
      {
        material: "IGF-1 LR3",
        description:
          "A modified long-acting IGF-1 analogue investigated for cellular growth signaling, anabolic pathways, and metabolic research.",
      },
      {
        material: "Kisspeptin",
        description:
          "A naturally occurring neuropeptide investigated for regulation of the hypothalamic-pituitary-gonadal axis and reproductive hormone signaling.",
      },
    ],
  },
  {
    slug: "immune-cellular-support",
    number: "06",
    title: "Immune & Cellular Support",
    icon: "/images/research/icons/immune-cellular-support.webp",
    rows: [
      {
        material: "L-Glutathione",
        description:
          "A major endogenous antioxidant investigated for redox balance, oxidative-stress pathways, cellular protection, and detoxification-related research.",
      },
      {
        material: "Thymosin Alpha-1",
        description:
          "A thymic peptide extensively investigated for immune-system modulation, innate and adaptive immune signaling, and cellular immune responses.",
      },
      {
        material: "Thymulin",
        description:
          "A thymic hormone investigated for immune regulation, T-cell function, inflammatory signaling, and thymic biology.",
      },
      {
        material: "LL-37",
        description:
          "An endogenous antimicrobial peptide investigated for innate immunity, antimicrobial activity, inflammatory signaling, and tissue-repair mechanisms.",
      },
    ],
  },
];
