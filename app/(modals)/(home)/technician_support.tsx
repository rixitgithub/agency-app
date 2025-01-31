import React, { useEffect, useState } from "react";
import {
    View,
    Modal,
    StyleSheet,
    TouchableOpacity,
    Text,
    TouchableWithoutFeedback,
    TextInput,
    SafeAreaView,
    ScrollView,
    ActivityIndicator,
    Linking,
    Platform,
} from "react-native";
import { BlurView } from 'expo-blur';
import { Colors } from "@/constants/Colors";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useGlobalContext } from "@/context/GlobalProvider";
import { Picker } from '@react-native-picker/picker';

interface BlurOverlayProps {
    visible: boolean;
    onRequestClose: () => void;
}

const BlurOverlay: React.FC<BlurOverlayProps> = ({ visible, onRequestClose }) => (
    <Modal
        animationType="fade"
        transparent={true}
        visible={visible}
        onRequestClose={onRequestClose}
    >
        <TouchableWithoutFeedback onPress={onRequestClose}>
            <BlurView intensity={90} tint="light" style={styles.overlay} />
        </TouchableWithoutFeedback>
    </Modal>
);

interface Technician {
    _id: string;
    technicianType: string;
    name: string;
    city: string;
    mobileNumber: string;
    alternateNumber: string;
    vehicleType: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

const TechnicianSupport: React.FC = () => {
    const [technicians, setTechnicians] = useState<Technician[]>([]);
    const [filteredTechnicians, setFilteredTechnicians] = useState<Technician[]>([]);
    const [loading, setLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [idToDelete, setIdToDelete] = useState<null|string>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [vehicleFilter, setVehicleFilter] = useState('');
    const { apiCaller, setEditData, refresh } = useGlobalContext();

    const fetchTechnicians = async () => {
        try {
            setLoading(true);
            const response = await apiCaller.get('/api/technician');
            setTechnicians(response.data.data);
            setFilteredTechnicians(response.data.data);
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTechnicians();
    }, [refresh]);

    useEffect(() => {
        const filtered = technicians.filter(tech => 
            tech.technicianType.toLowerCase().includes(searchQuery.toLowerCase()) &&
            (vehicleFilter === '' || tech.vehicleType === vehicleFilter)
        );
        setFilteredTechnicians(filtered);
    }, [searchQuery, vehicleFilter, technicians]);

    const handleDelete = async() => {
        await apiCaller.delete(`/api/technician?technicianId=${idToDelete}`);
        setShowDeleteModal(false);
        fetchTechnicians();
    };

    const dialNumber = (number: string) => {
        Linking.openURL(`tel:${number}`);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.searchContainer}>
                <FontAwesome5 name="search" size={18} color={Colors.secondary} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search technician category..."
                    placeholderTextColor={Colors.secondary}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            <View style={styles.filterContainer}>
                <Picker
                    selectedValue={vehicleFilter}
                    style={styles.picker}
                    onValueChange={(itemValue) => setVehicleFilter(itemValue)}
                >
                    <Picker.Item label="All Vehicle Types" value="" />
                    <Picker.Item label="CAR" value="CAR" />
                    <Picker.Item label="BUS" value="BUS" />
                    <Picker.Item label="TRUCK" value="TRUCK" />
                    <Picker.Item label="TAMPO" value="TAMPO" />
                </Picker>
            </View>

            <TouchableOpacity onPress={() => router.push("add_technician")} style={styles.addButton}>
                <Text style={styles.addButtonText}>Add Technician</Text>
            </TouchableOpacity>

            {loading ? (
                <ActivityIndicator size="large" color={Colors.darkBlue} />
            ) : (
                <ScrollView style={styles.techniciansList}>
                    {filteredTechnicians.map((technician) => (
                        <View key={technician._id} style={styles.card}>
                            <View style={styles.cardHeader}>
                                <TouchableOpacity onPress={()=>{setEditData(technician);router.push("edit_technician")}} style={styles.editButton}>
                                    <Text style={styles.editButtonText}>Edit form</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => {setShowDeleteModal(true); setIdToDelete(technician._id)}}> 
                                    <MaterialIcons name="delete" size={24} color={Colors.darkBlue} />
                                </TouchableOpacity>
                            </View>
                            <View style={[styles.cardHeader, { marginBottom: 2, marginTop: 5 }]}>
                                <TouchableOpacity onPress={() => dialNumber(technician.mobileNumber)}>
                                    <MaterialIcons name="phone-in-talk" size={24} color={Colors.darkBlue} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => dialNumber(technician.alternateNumber)}>
                                    <MaterialIcons name="phone-in-talk" size={24} color={Colors.secondary} />
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.cardText}>Technician Name: <Text style={{ color: "black" }}> {technician.name}</Text></Text>
                            <Text style={styles.cardText}>Technician Type: <Text style={{ color: "black" }}> {technician.technicianType}</Text></Text>
                            <Text style={styles.cardText}>Vehicle Type: <Text style={{ color: "black" }}> {technician.vehicleType}</Text></Text>
                            <Text style={styles.cardText}>City: <Text style={{ color: "black" }}> {technician.city}</Text></Text>
                        </View>
                    ))}
                </ScrollView>
            )}

            {/* Delete Confirmation Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={showDeleteModal}
                onRequestClose={() => setShowDeleteModal(false)}
            >
                <BlurOverlay visible={showDeleteModal} onRequestClose={() => setShowDeleteModal(false)} />

                <TouchableWithoutFeedback onPress={() => setShowDeleteModal(false)}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContainer}>
                            <View style={styles.modalContent}>
                                <Text style={styles.modalText}>Are you sure you want to delete this technician?</Text>
                                <View style={styles.modalButtons}>
                                    <TouchableOpacity style={[styles.modalButton, { backgroundColor: "#ccc" }]} onPress={() => setShowDeleteModal(false)}>
                                        <Text style={styles.modalButtonText}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.modalButton, { backgroundColor: Colors.darkBlue }]} onPress={handleDelete}>
                                        <Text style={[styles.modalButtonText, { color: "#fff" }]}>Delete</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </SafeAreaView>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#ffffff",
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderColor: Colors.secondary,
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 15,
        marginBottom: 10,
        paddingVertical: 5,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        color: Colors.secondary,
    },
    filterContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    picker: {
        flex: 1,
        marginHorizontal: 5,
    },
    addButton: {
        backgroundColor: Colors.darkBlue,
        paddingVertical: 10,
        borderRadius: 5,
        alignItems: "center",
        marginBottom: 20,
        width: 140,
    },
    addButtonText: {
        color: "#fff",
        fontWeight: "bold",
    },
    techniciansList: {
        flex: 1,
    },
    card: {
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 5,
        marginBottom: 20,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        position: "relative",
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "flex-end",
        marginBottom: 10,
        gap: 30,
        alignItems: "center",
    },
    editButton: {
        backgroundColor: Colors.darkBlue,
        paddingHorizontal: 10,
        borderRadius: 5,
        paddingVertical: 5,
    },
    editButtonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 12,
    },
    cardText: {
        marginBottom: 8,
        color: Colors.secondary,
        fontWeight: "500",
        fontSize: 13,
    },
    modalContainer: {
        justifyContent: "center",
        alignItems: "center",
        marginHorizontal: 5,
        marginVertical: 'auto'
    },
    modalOverlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    modalScroll: {
        flex: 1,
        paddingTop: Platform.OS === 'android' ? 20 : 0,
        paddingHorizontal: 20,
        marginVertical: 'auto'
    },
    modalContent: {
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 10,
        alignItems: "center",
        elevation: 5,
        maxHeight: 400,
    },
    modalText: {
        marginBottom: 20,
        fontSize: 18,
        textAlign: "center",
    },
    inputGroup: {
        marginBottom: 15,
        width: '100%'
    },
    label: {
        marginBottom: 5,
        fontSize: 13,
        color: Colors.secondary,
        fontWeight: "500"
    },
    input: {
        borderColor: Colors.secondary,
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 10,
        height: 40,
        width: '100%'
    },
    modalButtons: {
        flexDirection: "row",
        width: '100%',
        justifyContent: "space-between"
    },
    modalButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 5,
        alignItems: "center",
        width: '48%'
    },
    modalButtonText: {
        fontWeight: "bold",
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
    },
});

export default TechnicianSupport;