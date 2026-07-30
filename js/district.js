/**
 * District and Taluk Mapping Data for Kerala & Dynamic District Handling
 */

const DistrictData = (() => {
  const districtMap = {
    "Palakkad": ["Palakkad", "Alathur", "Chittur", "Pattambi", "Ottapalam", "Mannarkkad"],
    "Malappuram": ["Eranad", "Tirur", "Tirurangadi", "Ponnani", "Perinthalmanna", "Nilambur", "Kondotty"]
  };

  const placesMap = {
    "Palakkad": ["Pattambi", "Alanallur", "Ambalapara", "Ananganadi", "Chalavara", "Cherpulassery", "Chemmalassery", "Chunangad", "Kalladathur", "Kanjirappuzha", "Kappur", "Karakurissi", "Karalmanna", "Karimba", "Karimpuzha", "Kodalur", "Kongad", "Koppam", "Kottoppadam", "Kulukkallur", "Kumaramputhur", "Lakkidi-Perur", "Mannarkkad", "Mele Pattambi", "Moorkkanad", "Muthuthala", "Nellaya", "Ongallur", "Pallipuram", "Panamanna", "Parudur", "Pattithara", "Payyanadam", "Perur", "Pookkottukavu", "Pulassery", "Sankaramangalam", "Sreekrishnapuram", "Thachampara", "Thenkara", "Thrikkadeeri", "Thiruvegappura", "Vallapuzha", "Valambur", "Vaniyamkulam", "Vellinezhi", "Vilayur"],
    "Malappuram": ["A.R. Nagar", "Akampadam", "Alamkode", "Aliparamba", "Amarambalam", "Anakkayam", "Anamangad", "Angadippuram", "Areecode", "Ariyallur", "Athavanad", "Chaliyar", "Chalakkal", "Cheekode", "Chelembra", "Chembrasseri", "Cherukavu", "Cheriyamundam", "Chokkad", "Chungathara", "Edappal", "Edappatta", "Edarikode", "Edavanna", "Edakkara", "Elamkulam", "Elankur", "Ezhuvathiruthy", "Irimbiliyam", "Kadikad", "Kalady", "Kalikavu", "Kalpakancheri", "Kannamangalam", "Karakunnu", "Karuvarakundu", "Karulai", "Karyavattam", "Kattiparuthi", "Kavanur", "Keezhattur", "Keezhuparamba", "Kerala Estate", "Kodur", "Kondotty", "Koottilangadi", "Kottakkal", "Kurumbalangode", "Kurumbathur", "Kuruvambalam", "Kuruva", "Kuzhimanna", "Malappuram", "Mampad", "Mangalam", "Mankada", "Manjeri", "Marakkara", "Maranchery", "Melattur", "Melmuri", "Moorkkanad", "Morayur", "Moothedam", "Muthuvallur", "Nannambra", "Nannamukku", "Narukara", "Nediyiruppu", "Neduva", "Nenmini", "Niramaruthur", "Nilambur", "Oorakam", "Othukkungal", "Ozhur", "Pallikkal", "Pandallur", "Pandikkad", "Panakkad", "Parappanangadi", "Parappur", "Pariyapuram", "Pathaikara", "Payyanad", "Perakamanna", "Perinthalmanna", "Perumpadappa", "Perumanna", "Peruvallur", "Ponmala", "Ponmundam", "Ponnani", "Porur", "Pothukallu", "Pookkottur", "Pulamanthole", "Pulikkal", "Pulpatta", "Puzhakkattiri", "Tanur", "Tavanur", "Thalakkad", "Thazhekkode", "Thenhippalam", "Thennala", "Thirunavaya", "Thiruvali", "Thrikkalangode", "Triprangode", "Tirur", "Tirurangadi", "Tanalur", "Tuvvur", "Urangattiri", "Vadakkanagara", "Valambur", "Valavannur", "Vallikunnu", "Vattamkulam", "Veliyancode", "Vellayur", "Vengara", "Vettathur", "Vettilappara", "Vettikattiri", "Vettom", "Vazhakkad", "Vazhayoor", "Vazhikkadavu"],
    "Thiruvananthapuram": ["Trivandrum City", "Neyyattinkara", "Attingal", "Nedumangad", "Varkala", "Kattakada", "Kazhakootam", "Kovalam", "Pothencode"],
    "Kollam": ["Kollam City", "Karunagappally", "Punalur", "Kottarakkara", "Paravur", "Pathanapuram", "Chathannoor", "Kundara"],
    "Pathanamthitta": ["Pathanamthitta", "Thiruvalla", "Adoor", "Pandalam", "Konni", "Ranni", "Mallappally", "Kozhencherry"],
    "Alappuzha": ["Alappuzha", "Cherthala", "Kayamkulam", "Chengannur", "Mavelikkara", "Ambalappuzha", "Haripad", "Kuttanad"],
    "Kottayam": ["Kottayam", "Changanassery", "Pala", "Ettumanoor", "Vaikom", "Kanjirappally", "Erattupetta", "Ponkunnam"],
    "Idukki": ["Thodupuzha", "Munnar", "Kumily", "Kattappana", "Nedumkandam", "Peermade", "Adimali", "Vagamon"],
    "Ernakulam": ["Kochi", "Ernakulam", "Aluva", "Perumbavoor", "Muvattupuzha", "Kothamangalam", "Angamaly", "North Paravur", "Tripunithura", "Kakkanad"],
    "Thrissur": ["Thrissur City", "Chalakudy", "Kodungallur", "Kunnamkulam", "Guruvayur", "Irinjalakuda", "Wadakkanchery", "Chavakkad"],
    "Kozhikode": ["Kozhikode City", "Vatakara", "Koyilandy", "Ramanattukara", "Feroke", "Payyoli", "Mukkam", "Thamarassery"],
    "Wayanad": ["Kalpetta", "Mananthavady", "Sulthan Bathery", "Panamaram", "Meenangadi", "Pulpally"],
    "Kannur": ["Kannur City", "Thalassery", "Payyanur", "Taliparamba", "Iritty", "Mattannur", "Kuthuparamba", "Chokli"],
    "Kasaragod": ["Kasaragod", "Kanhangad", "Nileshwaram", "Uppala", "Manjeshwar", "Cheruvathur", "Trikaripur"]
  };

  function getDistricts() {
    return Object.keys(districtMap);
  }

  function getTaluks(districtName) {
    return districtMap[districtName] || [];
  }
  
  function getPlaces(districtName) {
    return placesMap[districtName] || [];
  }

  return {
    getDistricts,
    getTaluks,
    getPlaces,
    districtMap,
    placesMap
  };
})();

if (typeof window !== 'undefined') {
  window.DistrictData = DistrictData;
}
