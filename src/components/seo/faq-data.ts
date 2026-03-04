// FAQ Data - Separated from client component to avoid bundling issues during SSG
// These exports can be safely used in server components

export interface FAQItem {
  question: string;
  answer: string;
}

// Predefined FAQ collections for different page types

export const HOMEPAGE_FAQS: FAQItem[] = [
  {
    question: 'Kakšna je povprečna cena stanovanja v Sloveniji?',
    answer: 'Mediana cene stanovanj v Sloveniji je približno 2.400 €/m². V Ljubljani je cena višja, okoli 4.000 €/m², medtem ko so v manjših krajih cene od 1.000 do 1.500 €/m². Cene so se od leta 2015 več kot podvojile.',
  },
  {
    question: 'Od kod prihajajo podatki o cenah nepremičnin?',
    answer: 'Vsi podatki prihajajo iz uradne Evidence trga nepremičnin (ETN), ki jo vodi Geodetska uprava RS (GURS). To so dejanske pogodbene cene iz realiziranih prodaj, ne oglaševane cene. Podatki se posodabljajo četrtletno.',
  },
  {
    question: 'Kako se izračuna cena na kvadratni meter?',
    answer: 'Cena na kvadratni meter (€/m²) se izračuna kot pogodbena cena deljena z uporabno površino nepremičnine. Za območja prikazujemo mediano, ki je srednja vrednost vseh transakcij – polovica prodaj je bila cenejših, polovica dražjih.',
  },
  {
    question: 'Kaj pomeni mediana cene?',
    answer: 'Mediana je srednja vrednost – če razvrstimo vse prodaje po ceni, je mediana tista na sredini. Za razliko od povprečja, mediana ni občutljiva na ekstremne vrednosti (zelo drage ali zelo poceni nepremičnine), zato bolje odraža tipično ceno.',
  },
  {
    question: 'Ali so prikazane cene nepremičnin trenutne?',
    answer: 'Podatki se posodabljajo četrtletno, ko GURS objavi nove podatke ETN. Najnovejši podatki so običajno stari 2-3 mesece. Za tekoče razmere na trgu svetujemo tudi pregled aktualnih oglasov.',
  },
  {
    question: 'Kaj je novogradnja?',
    answer: 'Novogradnja je nepremičnina, ki je bila prvič prodana in je ob času prodaje stara do 2 leti. Novogradnje so praviloma dražje od rabljenih nepremičnin – premija je tipično 20-40%.',
  },
];

export const STATISTIKA_FAQS: FAQItem[] = [
  {
    question: 'Kaj pomeni indeks cen nepremičnin?',
    answer: 'Indeks cen nepremičnin prikazuje relativno spremembo cen glede na bazno leto 2015 (= 100). Vrednost 207 pomeni, da so cene za 107% višje kot leta 2015. Indeks izračunava Statistični urad RS.',
  },
  {
    question: 'Kako se Slovenija primerja z EU?',
    answer: 'Slovenski indeks cen nepremičnin je nad povprečjem EU-27. Leta 2024 je slovenski indeks približno 207, kar je nad Avstrijo (ki je v zadnjih letih beležila padce) in blizu Hrvaške.',
  },
  {
    question: 'Zakaj so cene v Ljubljani toliko višje?',
    answer: 'Ljubljana kot glavno mesto in gospodarsko središče ima najvišje povpraševanje, omejeno ponudbo zemljišč in najvišje dohodke. Podobno velja za obalna mesta (Piran, Koper) in turistične kraje (Bled).',
  },
  {
    question: 'Kdaj so bile cene nepremičnin najnižje?',
    answer: 'Najnižje cene so bile v obdobju 2014-2015, po finančni krizi. Indeks je takrat padel na približno 95-100 (glede na bazno leto 2015). Od takrat so cene neprekinjeno rasle.',
  },
];

export const NOVOGRADNJE_FAQS: FAQItem[] = [
  {
    question: 'Koliko dražje so novogradnje od rabljenih nepremičnin?',
    answer: 'Novogradnje so tipično 20-40% dražje od rabljenih nepremičnin na m². Premija variira glede na lokacijo in leto – v zadnjih letih se je premija nekoliko zmanjšala zaradi večje ponudbe novih stanovanj.',
  },
  {
    question: 'Kolikšen delež prodaj so novogradnje?',
    answer: 'Delež novogradenj v vseh prodajah se giblje med 10-25%, odvisno od leta. V obdobjih gradbenih boomov (2007-2008, 2021-2023) je delež višji, v recesijskih letih nižji.',
  },
  {
    question: 'Kje se v Sloveniji največ gradi?',
    answer: 'Največ novogradenj se prodaja v Ljubljani in okolici, na Obali ter v večjih mestih (Maribor, Celje, Kranj). V zadnjih letih je opazna rast tudi v manjših krajih okoli Ljubljane.',
  },
];

export const LOKACIJA_FAQS: FAQItem[] = [
  {
    question: 'Kako natančni so podatki za mojo lokacijo?',
    answer: 'Natančnost je odvisna od števila transakcij v okolici. Za mestna območja z veliko prodajami so podatki bolj zanesljivi. Za podeželska območja z malo prodajami priporočamo širši radius iskanja.',
  },
  {
    question: 'Kaj pomeni radius iskanja?',
    answer: 'Radius določa, kako daleč od izbranega naslova iščemo primerljive transakcije. Manjši radius (500m) daje bolj lokalne podatke, večji radius (2km) vključi več transakcij za zanesljivejšo oceno.',
  },
  {
    question: 'Ali so prikazane vse prodaje v okolici?',
    answer: 'Prikazane so le tržne transakcije (prodaje na prostem trgu). Niso vključeni prenosi med sorodniki, dedovanja, prodaje po netržnih pogojih ipd.',
  },
];

export const LESTVICE_FAQS: FAQItem[] = [
  {
    question: 'Ali so to res najdražje prodane nepremičnine?',
    answer: 'Da, lestvice temeljijo na uradnih podatkih GURS ETN o dejansko realiziranih prodajah. Nekatere zelo visoke transakcije so lahko del večjih poslov (kompleksi, portfelji), kjer je cena posamezne enote manj relevantna.',
  },
  {
    question: 'Zakaj nekatere občine nimajo podatkov?',
    answer: 'Nekatere manjše občine imajo zelo malo transakcij (manj kot 10 na leto), kar onemogoča zanesljivo statistiko. Za take občine podatkov ne prikazujemo ali jih združujemo s sosednjimi.',
  },
  {
    question: 'Kako pogosto se lestvice posodabljajo?',
    answer: 'Lestvice se posodabljajo četrtletno, ko prejmemo nove podatke iz GURS ETN. Ob vsaki posodobitvi se lahko vrstni redi spremenijo.',
  },
];

export const NAJDRAZJE_NEPREMICNINE_FAQS: FAQItem[] = [
  {
    question: 'Katera je najdražja nepremičnina prodana v Sloveniji?',
    answer: 'Najdražje nepremičnine v Sloveniji presegajo 5 milijonov evrov. To so večinoma luksuzne vile na obali, prestižna stanovanja v središču Ljubljane ali poslovni objekti. Točen vrstni red si oglejte v lestvici.',
  },
  {
    question: 'Ali te cene vključujejo DDV?',
    answer: 'Za novogradnje (prva prodaja) je v ceni že vštet 9,5% DDV. Za rabljene nepremičnine se plača 2% davek na promet nepremičnin, ki praviloma ni vključen v prikazano ceno.',
  },
  {
    question: 'Zakaj so nekatere transakcije tako visoke?',
    answer: 'Nekatere visoke transakcije vključujejo večje komplekse, portfelj nepremičnin ali zemljišča z velikim potencialom za razvoj. Lahko gre tudi za prestižne lokacije z redkostno vrednostjo.',
  },
];

export const NAJDRAZJE_OBCINE_FAQS: FAQItem[] = [
  {
    question: 'Katera je najdražja občina v Sloveniji?',
    answer: 'Ljubljana je najdražja občina v Sloveniji s cenami stanovanj nad 4.000 €/m². Sledijo ji obalne občine (Piran, Izola, Ankaran) in turistične občine (Bled, Kranjska Gora).',
  },
  {
    question: 'Zakaj so cene na obali tako visoke?',
    answer: 'Obalna območja imajo omejeno ponudbo zemljišč, veliko povpraševanje (tudi tuji kupci) in visok turistični potencial. To vodi v višje cene kljub nižjim lokalnim dohodkom.',
  },
  {
    question: 'Kako se izračuna mediana za občino?',
    answer: 'Mediana za občino se izračuna iz vseh tržnih transakcij stanovanj v zadnjih 12 mesecih. Upoštevane so samo občine z vsaj 10 prodajami za statistično zanesljivost.',
  },
];

export const NAJCENEJSA_STANOVANJA_FAQS: FAQItem[] = [
  {
    question: 'Kakšna so najcenejša stanovanja v Ljubljani?',
    answer: 'Najcenejša stanovanja v Ljubljani so manjša stanovanja (do 30 m²) v starejših blokih ali v manj iskanih četrtih (Fužine, Štepanjsko naselje). Cene začnejo pri okoli 70.000–100.000 €.',
  },
  {
    question: 'Ali so te cene prilagojene inflaciji?',
    answer: 'Ne, prikazane so nominalne cene iz leta prodaje. Za primerjavo bi bilo treba upoštevati inflacijo – stanovanje za 50.000 € leta 2015 bi danes stalo približno 65.000 €.',
  },
  {
    question: 'Zakaj so nekatera stanovanja tako poceni?',
    answer: 'Zelo nizke cene lahko pomenijo majhno površino, slabo stanje, težavno lokacijo ali posebne okoliščine prodaje. Priporočamo preverjanje posameznih primerov.',
  },
];

export const NAJCENEJSE_OBCINE_FAQS: FAQItem[] = [
  {
    question: 'Katera je najcenejša občina v Sloveniji?',
    answer: 'Najcenejše občine so večinoma v Pomurju, Posavju in na Koroškem, s cenami stanovanj pod 1.000 €/m². Gre za območja z manjšim povpraševanjem, starejšim stanovanjskim fondom in nižjo ekonomsko aktivnostjo.',
  },
  {
    question: 'Zakaj so nekatere občine tako poceni?',
    answer: 'Nizke cene so posledica več dejavnikov: oddaljenost od večjih mest, manjša ponudba delovnih mest, starejša infrastruktura, depopulacija. Cene na m² so lahko tudi 3-5x nižje kot v Ljubljani.',
  },
  {
    question: 'Ali so poceni občine dobra investicija?',
    answer: 'Poceni občine lahko ponujajo visok donos pri oddajanju, vendar z višjim tveganjem. Potencial za rast cen je negotov in odvisen od gospodarskega razvoja regije. Za lastno bivanje so lahko odlična izbira.',
  },
];

export const NAJVECJE_PODRAZITVE_FAQS: FAQItem[] = [
  {
    question: 'Katere občine so se najbolj podražile?',
    answer: 'Največje podražitve so pogosto v manjših občinah, kjer posamezne dražje prodaje močno vplivajo na mediano. V večjih občinah so trendi bolj stabilni z letno rastjo 5-15%.',
  },
  {
    question: 'Ali velika podražitev pomeni dobro investicijo?',
    answer: 'Ne nujno. Visoka enoletna rast lahko pomeni volatilen trg z malo transakcijami. Za investicijske odločitve je priporočljivo upoštevati dolgoročne trende in število prodaj.',
  },
  {
    question: 'Kako se izračuna letna sprememba cene?',
    answer: 'Letna sprememba primerja mediano cene na m² v zadnjih 12 mesecih z mediano istega obdobja prejšnjega leta. Upoštevane so le občine z vsaj 10 prodajami v vsakem obdobju.',
  },
];

// Municipality-specific FAQ generator
export function getMunicipalityFAQs(municipalityName: string, medianPrice?: number): FAQItem[] {
  const priceStr = medianPrice
    ? `približno ${medianPrice.toLocaleString('sl-SI')} €/m²`
    : 'odvisna od lokacije znotraj občine';

  return [
    {
      question: `Kakšna je cena stanovanja v občini ${municipalityName}?`,
      answer: `Mediana cene stanovanj v občini ${municipalityName} je ${priceStr}. Za natančnejše podatke o specifičnih lokacijah uporabite funkcijo iskanja po naslovu.`,
    },
    {
      question: `Koliko transakcij je bilo v občini ${municipalityName}?`,
      answer: `Število transakcij se spreminja iz leta v leto. Za aktualne podatke o številu prodaj si oglejte statistiko na tej strani. Več transakcij pomeni bolj zanesljive cenovne ocene.`,
    },
    {
      question: `Kako se cene v ${municipalityName} primerjajo s Slovenijo?`,
      answer: `Primerjava z nacionalnim povprečjem je prikazana v statistiki na tej strani. Ljubljana in obalna mesta so nadpovprečna, večina ostalih občin je pod povprečjem.`,
    },
    {
      question: `Ali rastejo cene nepremičnin v ${municipalityName}?`,
      answer: `Letni trend je prikazan v statistiki na tej strani. Večina slovenskih občin beleži rast cen v zadnjih letih, čeprav z različnimi stopnjami.`,
    },
  ];
}
