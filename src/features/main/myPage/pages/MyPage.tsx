import PetInfo from '@/features/main/myPage/components/PetInfo';
import PetProfile from '@/features/main/myPage/components/PetProfile';
import { SettingsMenu } from '@/features/main/myPage/components/SettingsMenu';

const MyPage = () => {
    const petData = {
        name: '달이',
        birth: '2014-04-10',
        length: '8cm',
        weight: '3.5kg',
        breed: '토이푸들',
        photo: '/images/dog1.jpg',
        companions: [
            { id: 'pet2', photo: '/images/cat1.jpg' },
            { id: 'pet3', photo: '/images/dog2.jpg' },
        ],
    };

    return (
        <div className="p-6">
            <PetProfile pet={petData} />
            <PetInfo pet={petData} />
            <SettingsMenu />
        </div>
    );
};

export default MyPage;
