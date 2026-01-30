export interface Disk {
    disk_id: string;
    disk_number: number;
    movie_id: string;     //ID from movies table
    disk_region: string;  //ID from disk_region table
    disk_format: string;  //ID from disk_format table
};