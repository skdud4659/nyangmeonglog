import PetInfo from '@/features/myPage/components/PetInfo';
import PetProfile from '@/features/myPage/components/PetProfile';
import { SettingsMenu } from '@/features/myPage/components/SettingsMenu';
import NavLayout from '@/shared/components/layouts/NavLayout';

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
        <NavLayout>
            <div className="p-6">
                <PetProfile pet={petData} />
                <PetInfo pet={petData} />
                <SettingsMenu />
            </div>
        </NavLayout>
    );
};

export default MyPage;
