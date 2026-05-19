#include <iostream>
#include <fstream>
#include <string>
#include <vector>
#include <sstream>
#include <cstring>
#include <cstdlib>
#include <algorithm>

using namespace std;

// --- KEEPING THE ORIGINAL BST DATA STRUCTURES ---
typedef struct{
    int code;
    int recNo;
} BinTreeElementType;

typedef struct BinTreeNode *BinTreePointer;

struct BinTreeNode{
    BinTreeElementType Data;
    BinTreePointer LChild, RChild;
};

typedef enum {
    FALSE, TRUE
} boolean;

// --- UPDATED STUDENT STRUCTURE ---
typedef struct{
    int code; // Roll No
    char name[100];
    int maths;
    int science;
    int english;
    int history;
    int total;
    float percentage;
    char grade;
} StudentT;

// --- ORIGINAL BST FUNCTIONS ---
void CreateBST(BinTreePointer *Root){ *Root = NULL; }
boolean BSTEmpty(BinTreePointer Root){ return (Root==NULL) ? TRUE : FALSE; }

void RecBSTInsert(BinTreePointer *Root, BinTreeElementType Item){
    if(BSTEmpty(*Root)){
        (*Root) = (BinTreePointer)malloc(sizeof(struct BinTreeNode));
        (*Root)->Data.code = Item.code;
        (*Root)->Data.recNo = Item.recNo;
        (*Root)->LChild = NULL;
        (*Root)->RChild = NULL;
    }
    else if (Item.code < (*Root)->Data.code)
        RecBSTInsert(&(*Root)->LChild, Item);
    else if (Item.code > (*Root)->Data.code)
        RecBSTInsert(&(*Root)->RChild, Item);
}

void RecBSTSearch(BinTreePointer Root, BinTreeElementType KeyValue, boolean *Found, BinTreePointer *LocPtr){
    if (BSTEmpty(Root))
        *Found = FALSE;
    else if (KeyValue.code < Root->Data.code)
        RecBSTSearch(Root->LChild, KeyValue, Found, LocPtr);
    else if (KeyValue.code > Root->Data.code)
        RecBSTSearch(Root->RChild, KeyValue, Found, LocPtr);
    else {
        *Found = TRUE;
        *LocPtr = Root;
    }
}

// Inorder traversal to print code and record number
void RecBSTInorder(BinTreePointer Root){
    if (Root!=NULL){
        RecBSTInorder(Root->LChild);
        cout << "(" << Root->Data.code << ", " << Root->Data.recNo << "), ";
        RecBSTInorder(Root->RChild);
    }
}

// --- FILE I/O & LOGIC ---
const string DB_FILE = "students_db.dat";

vector<StudentT> loadAllStudents(BinTreePointer *Root) {
    CreateBST(Root);
    vector<StudentT> students;
    ifstream infile(DB_FILE);
    if (!infile) return students;

    string line;
    int recNo = 0;
    while (getline(infile, line)) {
        if (line.empty()) continue;
        stringstream ss(line);
        string token;
        StudentT s;
        
        getline(ss, token, ','); s.code = stoi(token);
        getline(ss, token, ','); strcpy(s.name, token.c_str());
        getline(ss, token, ','); s.maths = stoi(token);
        getline(ss, token, ','); s.science = stoi(token);
        getline(ss, token, ','); s.english = stoi(token);
        getline(ss, token, ','); s.history = stoi(token);
        getline(ss, token, ','); s.total = stoi(token);
        getline(ss, token, ','); s.percentage = stof(token);
        getline(ss, token, ','); s.grade = token[0];

        students.push_back(s);
        
        // Populate BST
        BinTreeElementType item;
        item.code = s.code;
        item.recNo = recNo++;
        RecBSTInsert(Root, item);
    }
    return students;
}

void saveAllStudents(const vector<StudentT>& students) {
    ofstream outfile(DB_FILE);
    for (const auto& s : students) {
        outfile << s.code << "," << s.name << "," << s.maths << "," << s.science << "," 
                << s.english << "," << s.history << "," << s.total << "," 
                << s.percentage << "," << s.grade << "\n";
    }
}

void printJSON(const vector<StudentT>& students) {
    cout << "[";
    for (size_t i = 0; i < students.size(); ++i) {
        const auto& s = students[i];
        cout << "{\"id\":\"" << s.code << "\",\"rollno\":\"" << s.code << "\",\"name\":\"" << s.name 
             << "\",\"maths\":" << s.maths << ",\"science\":" << s.science 
             << ",\"english\":" << s.english << ",\"history\":" << s.history 
             << ",\"total\":" << s.total << ",\"percentage\":\"" << s.percentage 
             << "\",\"grade\":\"" << s.grade << "\"}";
        if (i < students.size() - 1) cout << ",";
    }
    cout << "]\n";
}

// --- SORTING ALGORITHMS ---
void merge(vector<StudentT>& arr, int left, int mid, int right) {
    int n1 = mid - left + 1;
    int n2 = right - mid;
    vector<StudentT> L(n1), R(n2);

    for (int i = 0; i < n1; i++) L[i] = arr[left + i];
    for (int j = 0; j < n2; j++) R[j] = arr[mid + 1 + j];

    int i = 0, j = 0, k = left;
    while (i < n1 && j < n2) {
        if (strcmp(L[i].name, R[j].name) <= 0) {
            arr[k] = L[i];
            i++;
        } else {
            arr[k] = R[j];
            j++;
        }
        k++;
    }
    while (i < n1) {
        arr[k] = L[i];
        i++;
        k++;
    }
    while (j < n2) {
        arr[k] = R[j];
        j++;
        k++;
    }
}

void mergeSort(vector<StudentT>& arr, int left, int right) {
    if (left >= right) return;
    int mid = left + (right - left) / 2;
    mergeSort(arr, left, mid);
    mergeSort(arr, mid + 1, right);
    merge(arr, left, mid, right);
}

int partition(vector<StudentT>& arr, int low, int high) {
    float pivot = arr[high].percentage;
    int i = (low - 1);

    for (int j = low; j <= high - 1; j++) {
        if (arr[j].percentage >= pivot) { // Sort descending by percentage
            i++;
            swap(arr[i], arr[j]);
        }
    }
    swap(arr[i + 1], arr[high]);
    return (i + 1);
}

void quickSort(vector<StudentT>& arr, int low, int high) {
    if (low < high) {
        int pi = partition(arr, low, high);
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
    }
}

// --- AGGREGATE STATISTICS ---
void calculateAggregates(const vector<StudentT>& students) {
    if (students.empty()) {
        cout << "No students to calculate statistics.\n";
        return;
    }
    float totalPerc = 0;
    float highest = students[0].percentage;
    float lowest = students[0].percentage;

    for (const auto& s : students) {
        totalPerc += s.percentage;
        if (s.percentage > highest) highest = s.percentage;
        if (s.percentage < lowest) lowest = s.percentage;
    }

    cout << "\n--- Class Statistics ---\n";
    cout << "Class Average Percentage: " << (totalPerc / students.size()) << "%\n";
    cout << "Highest Percentage: " << highest << "%\n";
    cout << "Lowest Percentage: " << lowest << "%\n";
    cout << "------------------------\n";
}

// --- INTERACTIVE TERMINAL MENU ---
void menu(int *choice) {
    cout << "\n                  MENU                  \n";
    cout << "-------------------------------------------------\n";
    cout << "1. Insert new student\n";
    cout << "2. Search for a student\n";
    cout << "3. Print all students (Code Ascending)\n";
    cout << "4. Print students with a >= given percentage\n";
    cout << "5. Sort and Print all students by Name (Merge Sort)\n";
    cout << "6. Sort and Print all students by Grade/Percentage (Quick Sort)\n";
    cout << "7. View Class Statistics\n";
    cout << "8. Quit\n";
    cout << "\nChoice: ";
    do {
        cin >> *choice;
    } while (*choice < 1 || *choice > 8);
}

void runInteractiveTerminal() {
    BinTreePointer Root;
    vector<StudentT> students = loadAllStudents(&Root);
    int choice;
    
    do {
        menu(&choice);
        if (choice == 1) {
            StudentT s;
            cout << "Give student's Roll Number (AM): ";
            cin >> s.code;
            
            boolean found;
            BinTreePointer loc;
            BinTreeElementType key;
            key.code = s.code;
            RecBSTSearch(Root, key, &found, &loc);
            
            if (found == TRUE) {
                cout << "A student with the same code is already in the tree\n";
            } else {
                cout << "Give student name: ";
                cin.ignore();
                cin.getline(s.name, 100);
                
                cout << "Give student's Maths marks(0-100): "; cin >> s.maths;
                cout << "Give student's Science marks(0-100): "; cin >> s.science;
                cout << "Give student's English marks(0-100): "; cin >> s.english;
                cout << "Give student's History marks(0-100): "; cin >> s.history;
                
                s.total = s.maths + s.science + s.english + s.history;
                s.percentage = (float)s.total / 4.0;
                
                if (s.percentage >= 90) s.grade = 'A';
                else if (s.percentage >= 80) s.grade = 'B';
                else if (s.percentage >= 70) s.grade = 'C';
                else if (s.percentage >= 60) s.grade = 'D';
                else s.grade = 'F';
                
                students.push_back(s);
                saveAllStudents(students);
                
                // Rebuild BST
                key.recNo = students.size() - 1;
                RecBSTInsert(&Root, key);
            }
        }
        else if (choice == 2) {
            int code;
            cout << "Give student's code: ";
            cin >> code;
            
            boolean found;
            BinTreePointer loc;
            BinTreeElementType key;
            key.code = code;
            RecBSTSearch(Root, key, &found, &loc);
            
            if (found == TRUE) {
                StudentT s = students[loc->Data.recNo];
                cout << s.code << ", " << s.name << ", Total: " << s.total 
                     << ", Percentage: " << s.percentage << "%, Grade: " << s.grade << "\n";
            } else {
                cout << "There is no student with this code\n";
            }
        }
        else if (choice == 3) {
            cout << "Print all students (Code, Number of record) ascending order(Code): \n";
            RecBSTInorder(Root);
            cout << "\n";
        }
        else if (choice == 4) {
            float minPerc;
            cout << "Give the minimum percentage: ";
            cin >> minPerc;
            while (minPerc < 0) {
                cout << "Percentage can't be a negative number\n";
                cout << "Give the minimum percentage: ";
                cin >> minPerc;
            }
            
            for (const auto& s : students) {
                if (s.percentage >= minPerc) {
                    cout << s.code << ", " << s.name << ", " << s.percentage << "%\n";
                }
            }
        }
        else if (choice == 5) {
            if (students.empty()) {
                cout << "No students available.\n";
            } else {
                vector<StudentT> sortedStudents = students; // Create a copy to sort
                mergeSort(sortedStudents, 0, sortedStudents.size() - 1);
                cout << "Students sorted by Name (Ascending):\n";
                for (const auto& s : sortedStudents) {
                    cout << s.name << " (Roll: " << s.code << "), Percentage: " << s.percentage << "%, Grade: " << s.grade << "\n";
                }
            }
        }
        else if (choice == 6) {
            if (students.empty()) {
                cout << "No students available.\n";
            } else {
                vector<StudentT> sortedStudents = students; // Create a copy to sort
                quickSort(sortedStudents, 0, sortedStudents.size() - 1);
                cout << "Students sorted by Percentage (Descending):\n";
                for (const auto& s : sortedStudents) {
                    cout << s.name << " (Roll: " << s.code << "), Percentage: " << s.percentage << "%, Grade: " << s.grade << "\n";
                }
            }
        }
        else if (choice == 7) {
            calculateAggregates(students);
        }
    } while (choice != 8);
}

int main(int argc, char* argv[]) {
    // If no arguments, run interactive CLI menu
    if (argc == 1) {
        runInteractiveTerminal();
        return 0;
    }

    // Otherwise, run JSON API Mode
    string command = argv[1];
    BinTreePointer Root;
    vector<StudentT> students = loadAllStudents(&Root);

    if (command == "list") {
        printJSON(students);
    } 
    else if (command == "add" || command == "update") {
        if (argc < 8) return 1;
        
        StudentT s;
        s.code = stoi(argv[2]);
        strcpy(s.name, argv[3]);
        s.maths = stoi(argv[4]);
        s.science = stoi(argv[5]);
        s.english = stoi(argv[6]);
        s.history = stoi(argv[7]);
        
        s.total = s.maths + s.science + s.english + s.history;
        s.percentage = (float)s.total / 4.0;
        
        if (s.percentage >= 90) s.grade = 'A';
        else if (s.percentage >= 80) s.grade = 'B';
        else if (s.percentage >= 70) s.grade = 'C';
        else if (s.percentage >= 60) s.grade = 'D';
        else s.grade = 'F';

        // Check if exists in BST
        boolean found;
        BinTreePointer loc;
        BinTreeElementType key;
        key.code = s.code;
        RecBSTSearch(Root, key, &found, &loc);
        
        if (found == TRUE) {
            // Update
            students[loc->Data.recNo] = s;
        } else {
            // Add new
            students.push_back(s);
        }
        
        saveAllStudents(students);
        printJSON(students);
    }
    else if (command == "stats") {
        if (students.empty()) {
            cout << "{\"average\":0,\"highest\":0,\"lowest\":0}";
        } else {
            float totalPerc = 0;
            float highest = students[0].percentage;
            float lowest = students[0].percentage;

            for (const auto& s : students) {
                totalPerc += s.percentage;
                if (s.percentage > highest) highest = s.percentage;
                if (s.percentage < lowest) lowest = s.percentage;
            }
            float average = totalPerc / students.size();
            cout << "{\"average\":" << average << ",\"highest\":" << highest << ",\"lowest\":" << lowest << "}";
        }
    }
    else if (command == "delete") {
        if (argc < 3) return 1;
        int code = stoi(argv[2]);
        
        boolean found;
        BinTreePointer loc;
        BinTreeElementType key;
        key.code = code;
        RecBSTSearch(Root, key, &found, &loc);
        
        if (found == TRUE) {
            students.erase(students.begin() + loc->Data.recNo);
            saveAllStudents(students);
        }
        printJSON(students);
    }

    return 0;
}
