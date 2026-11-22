// Log lines: Glass Heights. The owner's draft (2026-11-22, docs/log-lines-prompt.md), as pasted. Every named
// place is canon (WORLD.md Glass Heights: the Lower Arcade, Transfer Lounge, Service Steps and its shrine, Venn
// House, the Demonstration Floor, the Late Counter). Read by core/advlog.js (DISTRICT_LINES).
export default {
  district: 'heights',

  contacts: [
    { name: 'Yuen Ka-lai', what: 'a parcel-locker attendant who checked collection numbers before looking up' },
    { name: 'Marisol de Vera', what: 'a cleaning-shift supervisor who kept spare meal vouchers for late staff' },
    { name: 'Fong Chi-keung', what: 'a retired lift technician covering a repair kiosk three afternoons a week' },
    { name: 'Devika Shah', what: 'a serviced-apartment receptionist who knew which luggage had outlasted its booking' },
    { name: 'Ko Wing-yan', what: 'a junior laboratory stores clerk who ate lunch with the stockroom door open' },
    { name: 'Idrissa Ba', what: 'a loading-bay dispatcher who wrote actual arrival times beside the scheduled ones' },
    { name: 'Teresa Leal', what: 'a document-shop owner who kept a magnifying glass beside the signature pad' },
    { name: 'Cheung Suk-yee', what: 'a uniform alterations worker who let night staff collect after closing' },
    { name: 'Rafiq Mirza', what: 'a ventilation contractor who carried filter samples in a biscuit tin' },
    { name: 'Lam Hoi-ting', what: 'a catering assistant who remembered which meeting rooms returned untouched food' },
    { name: 'Nelia Santos', what: 'a repair-counter owner who tested every charger before accepting it' },
    { name: 'Tsang Man-fai', what: 'a night-shift cloakroom attendant who studied accountancy between collections' },
  ],

  places: [
    'the parcel lockers at the public end of the Lower Arcade',
    'the noodle-counter tables in the Lower Arcade',
    'the repair kiosk beneath the Lower Arcade escalators',
    'the luggage benches outside the Transfer Lounge',
    'the window table beside the Transfer Lounge departure screen',
    'the lowest landing of the Service Steps',
    'the sheltered bench opposite the Service Steps shrine',
    'the public reception desk at Venn House',
    'the visitor seats beneath the Venn House reception clock',
    'the public reception counter outside the Demonstration Floor',
    'the Late Counter beside the Lower Arcade shutters',
    'the document shop facing the Lower Arcade parcel lockers',
    'the uniform alterations counter below the serviced apartments',
    'the covered courier waiting area outside the loading entrance',
  ],

  quiet: [
    "{who} waited beside the Lower Arcade lockers while office staff collected parcels without breaking their calls. Our collection number never appeared.",
    "The Venn House clock ticked through the afternoon. Reception offered another glass of water, but no message.",
    "At the Transfer Lounge, someone slept against a suitcase with an accommodation approval open on their handset. We waited at the next table.",
    "Cleaners ate beside the exhaust vents while the lobby café stacked its chairs. Nobody answered our message.",
    "The Demonstration Floor sorted the same spotless parcels behind the glass. {who} watched enough circuits to recognise a dent in one box.",
    "A security drone checked the edge of the public arcade at regular intervals. We stayed at our table; the appointment remained unconfirmed.",
    "The Late Counter owner put covered meals aside for the laboratory shift. Our handset stayed quiet beside the cutlery pot.",
    "Above the Service Steps shrine, a cleaner straightened the incense tin before heading upstairs. We waited on the bench opposite.",
    "The executive windows went dark while lights stayed on in the laboratories. We still had no reply.",
    "A receptionist answered every external call with 'Apex Ridge' and gave directions to Glass Heights between calls. Nobody called for us.",
    "The public arcade filled with people waiting for the rain to ease before walking downhill. {who} kept watching the agreed entrance.",
    "A visiting engineer rehearsed the same explanation over tea at the Transfer Lounge. Our appointment time passed without confirmation.",
  ],

  snag: [
    "Our collection reference covered the parcel but not the loading bay. We paid for it to be brought down to the public counter.",
    "{who} caught a finger in a folding visitor chair at Venn House. A small cut needed a plaster before we continued.",
    "The loading desk charged a missed-slot fee while the authorising manager was still answering our message. We paid to keep the collection booked.",
    "The Transfer Lounge required another purchase to keep the table. We bought tea at serviced-apartment prices.",
    "A tower's parcel desk rejected our bag as unsuitable for its collection trolley. We paid for a rigid carrier from the arcade shop.",
    "{who} slipped on the wet Service Steps. A bruised shin slowed the climb.",
    "The public lift was out, and the service lift needed permission we did not have. We paid a porter to move the load by the approved route.",
    "A tenant's collection form needed a printed signature rather than the message on our handset. The document shop charged for the print and scan.",
    "The parcel desk's storage allowance expired while we waited for approval upstairs. We paid the extra holding charge.",
    "The loading entrance closed before our paperwork cleared. We paid to leave the load in supervised storage rather than carry it downhill again.",
  ],
};
