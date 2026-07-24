/**
 * District and Taluk Mapping Data for Kerala & Dynamic District Handling
 */

const DistrictData = (() => {
  const districtMap = {
    "Palakkad": ["Palakkad", "Alathur", "Chittur", "Pattambi", "Ottapalam", "Mannarkkad"],
    "Malappuram": ["Eranad", "Tirur", "Tirurangadi", "Ponnani", "Perinthalmanna", "Nilambur", "Kondotty"],
    "Thiruvananthapuram": ["Neyyattinkara", "Kattakada", "Nedumangad", "Thiruvananthapuram", "Chirayinkeezhu", "Varkala"],
    "Kollam": ["Kollam", "Karunagappally", "Kunnathur", "Kottarakkara", "Pathanapuram", "Punalur"],
    "Pathanamthitta": ["Adoor", "Konni", "Kozhencherry", "Ranni", "Mallappally", "Thiruvalla"],
    "Alappuzha": ["Ambalappuzha", "Kuttanad", "Cherthala", "Karthikappally", "Chengannur", "Mavelikkara"],
    "Kottayam": ["Kottayam", "Changanassery", "Vaikom", "Meenachil", "Kanjirappally"],
    "Idukki": ["Devikulam", "Thodupuzha", "Udumbanchola", "Peermade", "Idukki"],
    "Ernakulam": ["Aluva", "Kothamangalam", "Kunnathunad", "Muvattupuzha", "Paravur", "Kanayannur", "Kochi"],
    "Thrissur": ["Thrissur", "Mukundapuram", "Chalakudy", "Kodungallur", "Chavakkad", "Kunnamkulam", "Thalapilly"],
    "Kozhikode": ["Kozhikode", "Koyilandy", "Vatakara", "Thamarassery"],
    "Wayanad": ["Vythiri", "Mananthavady", "Sulthan Bathery"],
    "Kannur": ["Kannur", "Thalassery", "Iritty", "Payyanur", "Taliparamba"],
    "Kasaragod": ["Kasaragod", "Kanhangad", "Hosdurg", "Manjeshwaram", "Vellarikundu"]
  };

  function getDistricts() {
    return Object.keys(districtMap);
  }

  function getTaluks(districtName) {
    return districtMap[districtName] || [];
  }

  return {
    getDistricts,
    getTaluks,
    districtMap
  };
})();

if (typeof window !== 'undefined') {
  window.DistrictData = DistrictData;
}
