const PetInfo = ({ pet }: any) => {
    return (
        <div className="flex bg-[#F38E8E]/10 rounded-xl mt-6 divide-x divide-gray-300">
            <div className="flex-1 text-center py-4">
                <p className="text-sm text-gray-500">길이</p>
                <p className="font-bold">{pet.length}</p>
            </div>
            <div className="flex-1 text-center py-4">
                <p className="text-sm text-gray-500">몸무게</p>
                <p className="font-bold">{pet.weight}</p>
            </div>
            <div className="flex-1 text-center py-4">
                <p className="text-sm text-gray-500">종</p>
                <p className="font-bold">{pet.breed}</p>
            </div>
        </div>
    );
};

export default PetInfo;
