# api-krs
Course selection sheet information system API 

## **Admin Routes** 
`/admin/`
- ### Authentication
  - `POST` /login
     - URL untuk admin dalam melakukan login
     - JSON Body Example: `{"username": "Budi Rahardjo","password" : "qweqwe12323"}`
     - **Authentication Headers : `required`**
  - `POST` /signup
     - URL untuk admin dalam melakukan pendaftaran  
       Sistem akan melakukan pengecekan apakah username sudah ada   
     - JSON Body Example: `{"username": "Budi Rahardjo","password" : "qweqwe12323"}`
     - **Authentication Headers : `required`**
  - `DELETE` /logout
     - URL untuk admin dalam melakukan logout dari sistem  
       Sistem akan melakukan apakah user terautentikasi sebelumnya
     - **Authentication Headers : `required`**
  - `GET` /token
     - URL untuk mendapatkan CSRF Token  
       Token digunakan dalam auth header untuk beberapa jenis request
- ### `GET` request  
  - **/view-dosen**  
    - URL untuk mendapatkan semua daftar data - data dosen
  - **/view-mahasiswa**    
    - URL untuk mendapatkna semua daftar mahasiswa
  - **/view-matkul**  
    - URL untuk mendapatkan semua daftar matakuliah yang tersedia
  - **/view-kelas**
    - URL untuk mendapatkan daftar kelas yang tersedia
  - **/view-dosenpa**
    - URL untuk mendapatkan daftar dosen yang terdaftar sebagai dosen pembimbing akademik
  - **/view-bio**
    - URL untuk mendapatkan bio admin
  - **/view-jadwal**
    - URL untuk mendapatkan jadwal perkuliahan harian - mingguan
  - **/view-matkul/by/`:idMahasiswa`**
    - URL untuk mendapatkan seluruh matkul yang dimiliki mahasiswa dengan id `idMahasiswa`
    - **Required Params :**
       - `idMahasiswa`  
          idMahasiswa merupakan `nim` mahasiswa yang terdaftar pada database
  - **/view-mahasiswa/by/`:idMatkul`**
    - URL untuk mendapatkan seluruh mahasiswa yang memiliki matakuliah dengan id `idMatkul`
    - **Required Params :**
       - `idMatkul`  
          idMatkul merupakan `kode_kelas` matakuliah yang terdapat pada database
- ### `POST` request
  - **Authentication Headers : `required`**
  - **/add-mahasiswa**  
    - URL untuk menambahkan mahasiswa pada tabel Mahasiswa
    - JSON Body Example : `{"nim" : "092094102412421", "nama"  : "Foo Bar","tanggal_lahir" : "2003-11-20","gender" :"L","no_hp" : "08129071023","ipk" :"3","nip_dosen" : "123123123"}`
    - `Nullable` : **nip_dosen**
    - **nip_dosen** adalah `id` yang dimiliki oleh dosen pa yang terdaftar 
  - **/add-dosen**  
    - URL untuk menambahkan dosen pada tabel Dosen  
    - JSON Body Example : `{
    "nip" : "11512300245",
    "nama" : "Budi",
    "tanggal_lahir" : "1976-10-08",
    "gender" : "L",
    "no_hp" : "0821108812367"
    }`
    - `Nullable` : **none**
  - **/add-dosenpa**  
    - URL untuk menambahkan dosen pa pada tabel DosenPa dengan menggunakan daftar dosen yang tersedia dari tabel Dosen
    - JSON Body Example : `{
    "nip_dosen" : "115123001"
     }`
    - `Nullable` : **none**  
    - `nip_dosen` adalah nilai nip_dosen sebagai id dosen dari tabel Dosen
  - **/add-matkul**  
    - URL untuk menambahkan matakuliah pada tabel MataKuliah
    - JSON Body Example : `{
    "kode_kelas" : "PBASD-C",
    "nama_matkul" : "Pemrograman Basis Data",
    "sks" : 3,
    "kapasitas" : 32,
    "idJadwal" : "sel|asd234qweasdasdasd",
    "nip_dosen" : "123123124",
    "kode_ruang_kelas" : "F-4.10"
}`  
    - `Nullable` : `idJadwal` , `nip_dosen`, `kode_ruang_kelas`
    - `idJadwal` adalah `id` yang berasal dari tabel **jadwal**
    - `nip_dosen` adalah `nip` dari tabel **Dosen**
    - `kode_ruang_kelas` adalah `kode_ruang_kelas` yang berasal dari tabel **class_room** 
  - **/add-kelas**
    - URL untuk menambahkan kelas pada tabel class_room 
    - JSON Body Example : `{"kode_ruang_kelas" : "F-4.10", "kapasitas" : 30}`
    - `Nullable` : **none**
  - **/add-krs** 
    - URL untuk menambahkan krs mahasiswa
    - JSON Body Example : `{
    "MahasiswaNim" : "092094102412420",
    "MataKuliahKodeKelas" : "ASD-B"
}`
    - `Nullable` : **none**
    - `MahasiswaNim` adalah `nim` mahasiswa yang terdapat pada table Mahasiswa 
    - `MataKuliahKodeKelas` adalah `kode_kelas` yang terdapat pada table MataKuliah
  - **/add-jadwal**  
    - URL untuk menambahkan jadwal baru pada tabel `jadwal`
    - JSON Body Example : `{
    "hari": "senin",
    "start_time" : "08:55",
    "end_time" : "09:50"
}` 
    - `Nullable` : **none**
- ### `PUT` request
  - **Authentication Headers : `required`**
  - **/update-matkul/`:matkulId`** 
     - URL untuk mengupdate data matakuliah dari table MataKuliah
     - Query params example : `?nip_dosen=187293123&kode_ruang_kelas=F-4.10&nama_matkul=Pembasdat&sks=3&kapasitas=20&idJadwal=sel|hioqw91023`
     - `matkulId` adalah parameter berupa `kode_kelas` pada tabel MataKuliah
  - **/update-dosen/`:dosenId`**  
     - URL untuk mengupdate data dosen dati tabel Dosen
     - Query params example : `?nama=putuarya&tanggal_lahir=2003-01-20&gender=L&no_hp=0812310820`
     - `dosenId` adalah `nip` dosen yang ada pada tabel Dosen
  - **/update-mahasiswa/`:mhsId`** 
     - URL untuk mengupdate data mahasiswa dari tabel  Mahasiswa 
     - Query params example : `?nama=putuarya&tanggal_lahir=2004-03-20&gender=L&no_hp=98109280&ipk=4&nip_dosen=3`
     - `:mhsId` adalah `nim` mahasiswa dari table Mahasiswa
     - `nip_dosen` adalah `id` dosen PA dari tabel DosenPa
  - **/update-kelas/`:kodeRuangKelas`**
     - URL untuk mengaupdate data kelas dari tabel class_room 
     - Query params example : `?kapasitas=30`
     - `kodeRuangKelas` adalah `kode_ruang_kelas` dari tabel class_room
- ### `DELETE` request
  - **Authentication Headers : `required`**
  - **/delete-mahasiswa/`:mhsId`**
    - URL untuk menghapus row mahasiswa berdasarkan input `mhsId` sebagai params
    - `mhsId` adalah `nim` mahasiswa dari tabel **Mahasiswa**
  - **/delete-dosen/`:dosenId`** 
     - URL untuk menghapus row dosen berdasarkan input `dosenId` sebagai params
    - `dosenId` adalah `nip` mahasiswa dari tabel **Dosen**
  - **/delete-dosenpa/`:dosenPaId`**
      - URL untuk menghapus row dosenPa berdasarkan input `dosenPaId` sebagai params
    - `dosenPaId` adalah `id` dosenPa dari tabel **DosenPa**
  - **/delete-matkul/`:matkulId`**
     - URL untuk menghapus row matakuliah berdasarkan input `matkulId` sebagai params
    - `matkulId` adalah `kode_kelas` matakuliah dari tabel **MataKuliah**
  - **/delete-kelas/`:kelasId`** 
     - URL untuk menghapus row ruang kelas berdasarkan input `kelasId` sebagai params
    - `kelasId` adalah `kode_ruang_kelas`  dari tabel **class_room**
  - **/delete-jadwal/`:idJadwal`**
      - URL untuk menghapus row jadwal berdasarkan input `idJadwal` sebagai params
    - `idJadwal` adalah `id` dari tabel jadwal
## **Mahasiswa Routes**
`/mahasiswa/`
- ### Authentication
  - `POST` /login
     - URL untuk mahasiswa dalam melakukan login
     - JSON Body Example: `{"nim": "21718251029412","password" : "qweqwe12323"}`
     - Authentication Headers : `required`
     - `nim` adalah nim mahasiswa dari tabel mahasiswa dan telah terdaftar
  - `POST` /signup
     - URL untuk mahasiswa dalam melakukan pendaftaran  
       Sistem akan melakukan pengecekan nim sudah ada   
     - JSON Body Example: `{"nim": "21097301920123","password" : "qweqwe12323"}`
     - Authentication Headers : `required`
  - `DELETE` /logout
     - URL untuk mahasiswa dalam melakukan logout dari sistem  
       Sistem akan melakukan apakah user terautentikasi sebelumnya
     - Authentication Headers : `required`
  - `GET` /token
     - URL untuk mendapatkan CSRF Token  
       Token digunakan dalam auth header untuk beberapa jenis request
- ### `GET` request
  - **/view-mahasiswa**
    - URL untuk mendapatkan biodata dari mahasiswa yang terautentikasi
  - **/view-krs** 
    - URL untuk mendapatkan krs atau daftar matakuliah yang dimiliki oleh mahasiswa terautentikasi
  - **/view-matkul**
    - URL untuk mendapatkan daftar matakuliah yang tersedia dan dapat didaftarkan oleh mahasiswa terautentikasi pada krs
- ### `POST` request
  - **Authentication Headers : `required`**
  - **/edit-krs/add/`:idMatkul`
    - URL untuk menambahkan matakuliah pada krs mahasiswa
    - `idMatkul` adalah `kode_kelas` pada tabel **class_room**
- ### `DELETE` request
  - **Authentication Headers : `required`**
  - **/edit-krs/delete/`:idMatkul`
    - URL untuk menghapus matakuliah dari KRS mahasiswa 
    - `idMatkul` adalah `kode_kelas` pada tabel **class_room**

