import Link from 'next/link';

export default function SeoContent() {
  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Vse o cenah nepremičnin v Sloveniji
        </h2>

        <div className="space-y-4">
          <p className="text-gray-700 leading-relaxed">
            Nepremičninski trg v Sloveniji je v zadnjih letih doživel izjemno rast. Od leta 2015
            so se cene stanovanj v povprečju povišale za več kot 80%, pri čemer izstopa predvsem{' '}
            <Link href="/statistika/ljubljana" className="text-emerald-600 hover:text-emerald-700 font-medium">
              Ljubljana
            </Link>
            , kjer mediana cene na kvadratni meter za stanovanja presega 4.000 evrov. Podobno
            visoke cene beležijo tudi v{' '}
            <Link href="/statistika/piran" className="text-emerald-600 hover:text-emerald-700 font-medium">
              Piranu
            </Link>
            ,{' '}
            <Link href="/statistika/bled" className="text-emerald-600 hover:text-emerald-700 font-medium">
              Bledu
            </Link>
            {' '}in{' '}
            <Link href="/statistika/koper" className="text-emerald-600 hover:text-emerald-700 font-medium">
              Kopru
            </Link>
            , kjer turistična privlačnost dodatno dviguje povpraševanje.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 pt-4">
            Kako deluje ta portal?
          </h3>
          <p className="text-gray-700 leading-relaxed">
            CeneNepremičnin.com je največja baza podatkov o prodajah nepremičnin v Sloveniji.
            Naši podatki izhajajo iz{' '}
            <strong>Evidence trga nepremičnin (ETN)</strong>, ki jo vodi Geodetska uprava
            Republike Slovenije. V bazi je več kot <strong>266.000 transakcij</strong> od leta
            2007 do danes. Vsi podatki so javno dostopni in brezplačni.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Na{' '}
            <Link href="/" className="text-emerald-600 hover:text-emerald-700 font-medium">
              interaktivnem zemljevidu
            </Link>
            {' '}lahko raziskujete cene po katastrskih občinah ali občinah. Barvna lestvica
            prikazuje mediano cene na kvadratni meter, kar omogoča hitro primerjavo med
            različnimi območji. Za podrobnejšo analizo obiščite stran{' '}
            <Link href="/statistika" className="text-emerald-600 hover:text-emerald-700 font-medium">
              Statistika
            </Link>
            , kjer najdete časovne trende, primerjave z EU in več.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 pt-4">
            Kateri dejavniki vplivajo na cene?
          </h3>
          <p className="text-gray-700 leading-relaxed">
            Cene nepremičnin v Sloveniji so odvisne od številnih dejavnikov. Lokacija je
            najpomembnejša – stanovanja v centru Ljubljane so lahko tudi trikrat dražja od
            primerljivih v manjših mestih. Pomembni so tudi: starost nepremičnine (
            <Link href="/lestvice/novogradnje" className="text-emerald-600 hover:text-emerald-700 font-medium">
              novogradnje
            </Link>
            {' '}dosegajo 60% višjo ceno od rabljenih), nadstropje, energetska učinkovitost,
            parkiranje in bližina javnega prometa.
          </p>
          <p className="text-gray-700 leading-relaxed">
            V zadnjih letih smo priča tudi rasti cen na obrobju večjih mest. Občine kot so{' '}
            <Link href="/statistika/grosuplje" className="text-emerald-600 hover:text-emerald-700 font-medium">
              Grosuplje
            </Link>
            ,{' '}
            <Link href="/statistika/domzale" className="text-emerald-600 hover:text-emerald-700 font-medium">
              Domžale
            </Link>
            {' '}in{' '}
            <Link href="/statistika/kamnik" className="text-emerald-600 hover:text-emerald-700 font-medium">
              Kamnik
            </Link>
            {' '}beležijo nadpovprečno rast, saj kupci iščejo ugodnejše alternative bližnjim
            mestnim središčem ob dobri prometni povezanosti.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 pt-4">
            Kje najti ugodne nepremičnine?
          </h3>
          <p className="text-gray-700 leading-relaxed">
            Najugodnejša stanovanja najdete na{' '}
            <Link href="/lestvice/najcenejsa-stanovanja-ljubljana" className="text-emerald-600 hover:text-emerald-700 font-medium">
              lestvici najcenejših stanovanj
            </Link>
            . Med cenovno dostopnejšimi regijami izstopajo{' '}
            <strong>Pomurska</strong>, <strong>Koroška</strong> in <strong>Posavska</strong>,
            kjer mediana cen za stanovanja ostaja pod 1.700 evri na kvadratni meter.
            Seveda je treba upoštevati, da so tam tudi manjše možnosti zaposlitve in
            šibkejša infrastruktura.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Za celoten pregled{' '}
            <Link href="/lestvice/najdrazje-obcine" className="text-emerald-600 hover:text-emerald-700 font-medium">
              najdražjih in najcenejših občin
            </Link>
            {' '}ter{' '}
            <Link href="/lestvice/najdrazje-nepremicnine" className="text-emerald-600 hover:text-emerald-700 font-medium">
              rekordnih prodaj
            </Link>
            {' '}obiščite naše lestvice.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 pt-4">
            Viri podatkov
          </h3>
          <p className="text-gray-700 leading-relaxed">
            Vsi podatki na tej strani izhajajo iz uradnih javnih virov: Evidence trga
            nepremičnin (GURS), Statističnega urada RS (SI-STAT) ter Eurostata. Podatki so
            informativne narave in niso primerni za pravne ali finančne odločitve.
            Več o metodologiji preberite na strani{' '}
            <Link href="/o-podatkih" className="text-emerald-600 hover:text-emerald-700 font-medium">
              O podatkih
            </Link>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
