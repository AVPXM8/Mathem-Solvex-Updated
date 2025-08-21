import React from 'react';
import styles from './AwardCarousel.module.css';

const awardWinners = [
  { name: 'Ankit Singh', imageUrl: 'https://res.cloudinary.com/dcaq1inz0/image/upload/v1754885997/ANKIT_SINGH_xxh48q.jpg' },
  { name: 'Pradeep Rajbhar', imageUrl: 'https://res.cloudinary.com/dcaq1inz0/image/upload/v1754885983/PRADEEP_RAJBHAR_e2zdtm.jpg' },
  { name: 'Pankaj singh MNNIT Allahabad', imageUrl: 'https://res.cloudinary.com/dcaq1inz0/image/upload/v1754885969/PANKAJ_SINGH_qscau0.jpg' },
  { name: 'Dharamveer Singh', imageUrl: 'https://res.cloudinary.com/dcaq1inz0/image/upload/v1754885998/DHARAMVEER_SINGH_y4cw6m.jpg' },
  { name: 'Priyanshu Bajpai', imageUrl: 'https://res.cloudinary.com/dcaq1inz0/image/upload/v1755415572/Priyanshu_bajpai_hokqki.jpg' },
  { name: 'Prateek Katiyar', imageUrl: 'https://res.cloudinary.com/dcaq1inz0/image/upload/v1755415346/Prateek_kariyar_lv3xf0.jpg' },
  { name: 'Harsh Dixit', imageUrl: 'https://res.cloudinary.com/dcaq1inz0/image/upload/v1755415465/Harsh_dixit_bmrbnh.jpg' },
  { name: 'Deepak', imageUrl: 'https://res.cloudinary.com/dcaq1inz0/image/upload/v1755416110/DEEPAK_jzmpio.jpg' },
  { name: 'Vansh Kanaujiya', imageUrl: 'https://res.cloudinary.com/dcaq1inz0/image/upload/v1754885996/DEEPAK_lzajq7.jpg' },
  { name: 'Unnati Kushwaha', imageUrl: 'https://res.cloudinary.com/dcaq1inz0/image/upload/v1754885985/UNNATI_KUSHWAHA_ebbrkz.jpg' },
  { name: 'Unnati Mishra', imageUrl: 'https://res.cloudinary.com/dcaq1inz0/image/upload/v1754885982/UNNATI_MISHRA_ex4eu9.jpg' },
  { name: 'Varun Tiwari', imageUrl: 'https://res.cloudinary.com/dcaq1inz0/image/upload/v1754885986/VARUN_TIWARI_c448wc.jpg' },
  { name: 'Arpit Katiyar', imageUrl: 'https://res.cloudinary.com/dcaq1inz0/image/upload/v1754885990/ARPIT_KATIYAR_ikj3dz.jpg' },
  { name: 'Arshi Anam', imageUrl: 'https://res.cloudinary.com/dcaq1inz0/image/upload/v1754885993/ARSHI_ANAM_pbgblb.jpg' },
  { name: 'Ritika Manjhi', imageUrl: 'https://res.cloudinary.com/dcaq1inz0/image/upload/v1754885985/RITIKA_MAJHI_artmi8.jpg' },
  { name: 'Richa Chaudhary', imageUrl: 'https://res.cloudinary.com/dcaq1inz0/image/upload/v1754885972/RICHA_CHAUDHARY_f3ia6f.jpg' },
  { name: 'Jigyasa Dosar', imageUrl: 'https://res.cloudinary.com/dcaq1inz0/image/upload/v1754885948/Announcement_20250811_094222_0000_phoqre.jpg' },
  { name: 'Kashish Mishra', imageUrl: 'https://res.cloudinary.com/dcaq1inz0/image/upload/v1754885972/KASHISH_MISHRA_q6frpt.jpg' },
  { name: 'Kashish Gupta', imageUrl: 'https://res.cloudinary.com/dcaq1inz0/image/upload/v1754885985/KASHISH_GUPTA_w4r8pw.jpg' },
  { name: 'GARIMA tiwari', imageUrl: 'https://res.cloudinary.com/dcaq1inz0/image/upload/v1754885949/GARIMA_TIWARI_x8skpn.jpg' },
  { name: 'Abhishek Kumar', imageUrl: 'https://res.cloudinary.com/dcaq1inz0/image/upload/v1754885999/ABHISHEK_KUMAR_iqtugs.jpg' },
  { name: 'Shreya Omer', imageUrl: 'https://res.cloudinary.com/dcaq1inz0/image/upload/v1754885975/SHREYA_OMER_zolw1z.jpg' },
  { name: 'Nibha Yadav', imageUrl: 'https://res.cloudinary.com/dcaq1inz0/image/upload/v1754885963/NIBHA_YADAV_jubqqb.jpg' },
  { name: 'Ankit verma', imageUrl: 'https://res.cloudinary.com/dcaq1inz0/image/upload/v1754886003/ANKIT_VERMA_axxqpi.jpg' },
  { name: 'Divyajeet singh', imageUrl: 'https://res.cloudinary.com/dcaq1inz0/image/upload/v1754885962/DIVYAJEET_SINGH_rgcops.jpg' },
  { name: 'Vishal Singh', imageUrl: 'https://res.cloudinary.com/dcaq1inz0/image/upload/v1754885998/VISHAL_SINGH_vzhoiu.jpg' },
];


// We duplicate the array to create a seamless loop effect
const allImages = [...awardWinners, ...awardWinners];

const AwardCarousel = () => {
  return (
    <div className={styles.scrollerContainer}>
      <div className={styles.scroller}>
        {allImages.map((winner, index) => (
          <div className={styles.card} key={index}>
            <img 
              src={winner.imageUrl} 
              alt={`Award winner ${winner.name}`} 
              className={styles.cardImage}
              loading="lazy"
            />
            <div className={styles.cardOverlay}>
              <p className={styles.cardName}>{winner.name}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default AwardCarousel;