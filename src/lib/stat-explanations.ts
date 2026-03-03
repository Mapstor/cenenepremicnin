// Predefined explanations for common statistics
// Moved to separate file to avoid client component export issues

export const STAT_EXPLANATIONS = {
  medianaPriceM2: 'Mediana je srednja vrednost - polovica prodaj je bila cenejših, polovica dražjih. Je boljši kazalec od povprečja, ker ekstremne vrednosti nanjo ne vplivajo.',
  povprecjePriceM2: 'Povprečje je aritmetična sredina - seštevek vseh cen, deljen s številom transakcij. Ekstremno visoke ali nizke cene lahko povprečje izkrivijo.',
  letniTrend: 'Sprememba mediane cene v primerjavi z istim obdobjem lani. Pozitivna vrednost pomeni rast cen, negativna padec.',
  transakcije: 'Število realiziranih prodaj nepremičnin v izbranem obdobju. Vključuje le tržne transakcije (brez družinskih prenosov, dedovanj ipd.).',
  percentileQ1: 'Prvi kvartil (Q1) - 25% prodaj je bilo cenejših od te vrednosti.',
  percentileQ3: 'Tretji kvartil (Q3) - 25% prodaj je bilo dražjih od te vrednosti.',
  priceRange: 'Razpon cen med prvim (Q1) in tretjim kvartilom (Q3) pokriva srednjih 50% vseh transakcij.',
  novogradnje: 'Nepremičnine, ki so bile prodane prvič po izgradnji. Praviloma so dražje od rabljenih.',
  cenaNaM2: 'Cena na kvadratni meter uporabne površine. Omogoča primerjavo nepremičnin različnih velikosti.',
  uporabnaPovrsina: 'Neto tlorisna površina, ki jo lahko dejansko uporabljate. Ne vključuje skupnih prostorov, kleti ali balkonov.',
  indeksRasti: 'Indeks prikazuje relativno rast cen od baznega obdobja. 100 = bazno obdobje, 200 = podvojitev cen.',
  euPrimerjava: 'Primerjava slovenskega indeksa cen nepremičnin z evropskim povprečjem. Vir: Eurostat.',
  stanovanjaVsHise: 'Stanovanja so deli večstanovanjskih stavb, hiše so samostojne enodružinske stavbe.',
  radius: 'Iskalni radius okoli izbrane lokacije. Več transakcij v radiu pomeni bolj zanesljivo oceno.',
  povprecnaStarost: 'Povprečna starost prodanih nepremičnin v obdobju.',
  delezNovogradenj: 'Odstotek vseh prodanih nepremičnin, ki so bile novogradnje (stare do 2 leti).',
  premijaNovogradnje: 'Za koliko odstotkov so novogradnje dražje od rabljenih nepremičnin na m².',
  housepriceIndex: 'Indeks cen nepremičnin prikazuje spremembo cen glede na bazno leto 2015 (= 100). Vrednost 180 pomeni, da so cene za 80% višje kot leta 2015.',
} as const;

export type StatExplanationKey = keyof typeof STAT_EXPLANATIONS;
